define([
    'dojo',
    'coweb/main',
    './ld', 
    './textarea',
    './AttendeeList',
    'coweb/ext/attendance'
], function(dojo,coweb,ld,textarea,AttendeeList,attendance) {
    var TextEditor = function(args){
        if(!args.id)
            throw new Error('TextEditor: missing id argument'); 
        //1. Process args
        this.id = args.id;                      //Id for collab
        this.go = (!args.go) ? true : args.go;  //Start iteration cycle automatically
                
        //2. Connect things
        this._connectSyncs();
        
        //3. properties
        this._por           =   {start : 0, end: 0};
        this._container     =   dojo.create('div',{'class':'container'},args.domNode);
        this._textarea      =   new textarea({domNode:this._container,'id':'_textarea',parent:this,noSlider:true});
        this._attendeeList  =   new AttendeeList({domNode:dojo.byId('attendeeListContainer'), id:'_attendeeList', _textarea:this._textarea});
        this._util          =   new ld({});
        this.oldSnapshot    =   this.snapshot();
        this.newSnapshot    =   '';
        this.interval       =   100;             //Broadcast interval in ms
        this.t              =   null;           //Handle for timeouts
        this.q              =   [];             //Queue for incoming ops when paused
        this.min            =   0;              //Min caret pos in iteration loop
        this.max            =   0;              //Max caret pos in iteration loop
        this.on             =   true;           //Turn on/off outgoing syncs
        this.value          =   '';
        this._prevPor = {start : 0, end: 0};
        
        
        if(this.go == true)
            this.listenInit();
    };
    var proto = TextEditor.prototype;
    
    proto.onCollabReady = function(obj){
        this._site = obj.site;
        this.collab.pauseSync();
    };

    proto.listenInit = function(){
        this.collab.pauseSync();
        this.t = setTimeout(dojo.hitch(this, 'iterate'), this.interval);
    };
    
    proto.iterate = function() { 
        this.iterateSend();
        this.iterateRecv();
    };
    
    proto.iterateSend = function() {
        if(this.on==true){
            this.newSnapshot = this.snapshot();
            var oldLength = this.oldSnapshot.length;
            var newLength = this.newSnapshot.length;
            var syncs = null;
            var caretInfo = null;
            if((this._por.start != this._prevPor.start) || (this._por.end != this._prevPor.end)){
                caretInfo = {'start':this._por.start,'end':this._por.end,'site':this._site};
                this._prevPor.start = this._por.start;
                this._prevPor.end = this._por.end;
            }
            
            if(oldLength < newLength){
                var mx = this.max+(newLength - oldLength);
                //Paste optimization
                if(newLength-oldLength>50){
                    var text = this.newSnapshot.slice(this.min, mx);
                    for(var i=0; i<text.length; i++)
                        this.collab.sendSync('editorUpdate', {'char':text[i],'filter':[],'caretInfo':caretInfo}, 'insert', i+this.min);
                }else{
                    syncs = this._util.ld(this.oldSnapshot.slice(this.min, this.max), this.newSnapshot.slice(this.min, mx));
                    if(syncs){
                        for(var i=0; i<syncs.length; i++){
                            if(this._textarea._paste){
                                this.collab.sendSync('editorUpdate', {'char':syncs[i].ch,'filter':[],'caretInfo':caretInfo}, syncs[i].ty, syncs[i].pos+this.min);
                            }else{
                                this.collab.sendSync('editorUpdate', {'char':syncs[i].ch,'filter':this._textarea.filters,'caretInfo':caretInfo}, syncs[i].ty, syncs[i].pos+this.min);
                            }
                        }
                    }
                }
            }else if(newLength < oldLength){
                var mx = this.max+(oldLength-newLength);
                var mn = (this.min-1 > -1) ? this.min-1 : 0;
                syncs = this._util.ld(this.oldSnapshot.slice(mn, mx), this.newSnapshot.slice(mn, this.max));
                if(syncs){
                    for(var i=0; i<syncs.length; i++){
                        if(this._textarea._paste){
                            this.collab.sendSync('editorUpdate', {'char':syncs[i].ch,'filter':[],'caretInfo':caretInfo}, syncs[i].ty, syncs[i].pos+mn);
                        }else{
                            this.collab.sendSync('editorUpdate', {'char':syncs[i].ch,'filter':this._textarea.filters,'caretInfo':caretInfo}, syncs[i].ty, syncs[i].pos+mn);
                        }
                    }
                }
            }else if(newLength == oldLength){
                if(this.oldSnapshot != this.newSnapshot)
                    syncs = this._util.ld(this.oldSnapshot.slice(this.min, this.max), this.newSnapshot.slice(this.min, this.max));
                if(syncs){
                    for(var i=0; i<syncs.length; i++){
                        if(this._textarea._paste){
                            this.collab.sendSync('editorUpdate', {'char':syncs[i].ch,'filter':[],'caretInfo':caretInfo}, syncs[i].ty, syncs[i].pos+this.min);
                        }else{
                            this.collab.sendSync('editorUpdate', {'char':syncs[i].ch,'filter':this._textarea.filters,'caretInfo':caretInfo}, syncs[i].ty, syncs[i].pos+this.min);
                        }
                    }
                }
            }
            
            //Remote Carets
            if(!syncs && caretInfo){
                this.collab.sendSync('editorCaret', caretInfo, null);
            }
        }
    };
    
    proto.iterateRecv = function() {
        if(this.on == true)
            this.collab.resumeSync();
        this.collab.pauseSync();
        if(this.q.length != 0){
            this.runOps();
            
            dojo.publish("editorHistory", [{save:dojo.clone(this._textarea.value)}]);
        }
        this.q = [];
        this.oldSnapshot = this.snapshot();
        this._forcePOR();
        
        this.t = setTimeout(dojo.hitch(this, 'iterate'), this.interval);
    };
    
    proto.runOps = function(){
		this._textarea._destroyRemoteCarets();
        this.value = this._textarea.value;
        //this._updatePOR();
        for(var i=0; i<this.q.length; i++){
            if(this.q[i].type == 'insert'){
                this.insertChar(this.q[i].value['char'], this.q[i].position, this.q[i].value['filter']);
                if(this.q[i].value['caretInfo'] != null){
                    this._textarea.attendees[this.q[i].value['caretInfo'].site] = {
                        start: this.q[i].value['caretInfo'].start,
                        end: this.q[i].value['caretInfo'].end,
                        color: this._attendeeList.attendees[this.q[i].value['caretInfo'].site]['color']
                    };
                }
            }
            if(this.q[i].type == 'delete')
                this.deleteChar(this.q[i].position);
                if(this.q[i].value['caretInfo'] != null){
                    this._textarea.attendees[this.q[i].value['caretInfo'].site] = {
                        start: this.q[i].value['caretInfo'].start,
                        end: this.q[i].value['caretInfo'].end,
                        color: this._attendeeList.attendees[this.q[i].value['caretInfo'].site]['color']
                    };
                }
            if(this.q[i].type == 'update')
                this.updateChar(this.q[i].value['char'], this.q[i].position, this.q[i].value['filter']);
                if(this.q[i].value['caretInfo'] != null){
                    this._textarea.attendees[this.q[i].value['caretInfo'].site] = {
                        start: this.q[i].value['caretInfo'].start,
                        end: this.q[i].value['caretInfo'].end,
                        color: this._attendeeList.attendees[this.q[i].value['caretInfo'].site]['color']
                    };
                }
        }
        this._textarea.value = this.value;
        //this._moveCaretToPOR();
		this._textarea._renderRemoteCarets();
    };
    
    proto.onRemoteChange = function(obj){
        this.q.push(obj);
    };
    
    proto.onUserChange = function(params) {
        //Break if empty object
		if(!params.users[0])
			return;
		if(params.type == "join"){
			//Locally create a new listItem for the user
			this._attendeeList.onLocalUserJoin(params.users);
		}else if(params.type == "leave"){
			//Locally delete listItem for the user
			this._attendeeList.onUserLeave(params.users);
		}
    };
    
    proto.onRemoteCaretMove = function(obj){
        this._textarea.attendees[obj.value.site] = {
            start: obj.value.start,
            end: obj.value.end,
            color: this._attendeeList.attendees[obj.value.site]['color']
        };
        this._textarea._destroyRemoteCarets();
		this._textarea._renderRemoteCarets();
    };
        
    proto.insertChar = function(c, pos, filter) {
		this._updatePOR();
        var t = this._textarea;
        var ch;
		//Clear selection if inserting in current sel
        if(pos>t.value.start && pos<t.value.end){
            t.clearSelection(null, true);
            this._updatePOR();
        }
        var sel = Math.abs(t.value.start-t.value.end);
        por = this._por,
        start = por.start,
        end = por.end;
        var f = (filter == null || undefined) ? [] : filter;

		//update string in memory
        t.value.string = t.value.string.slice(0, pos).concat([c]).concat(t.value.string.slice(pos));
        
		//Fix all remote carets
        for(var j in t.attendees){
            var s = t.attendees[j].start;
            if(pos < t.attendees[j].start)
                ++s;
            t.attendees[j].start = s;
            t.attendees[j].end = s;
        }

		//custom DOM render
        if(pos<t.value.start || (pos==t.value.start && sel>0)){
            if((c.search('">') != -1)||(c.search("nbsp") != -1)){
                ch = (c.search("nbsp") == -1) ? c.substring(c.search('">')+2,c.search('">')+3) : '&nbsp; ';
                dojo.create('span',{innerHTML:ch,style:f.join("")},dojo.byId('thisFrame').childNodes[pos],'before');
            }else if(c.search('br') != -1){
                dojo.create('br',{},dojo.byId('thisFrame').childNodes[pos],'before');
            }
        }else{
            if((c.search('">') != -1)||(c.search("nbsp") != -1)){
                ch = (c.search("nbsp") == -1) ? c.substring(c.search('">')+2,c.search('">')+3) : '&nbsp; ';
                dojo.create('span',{innerHTML:ch,style:f.join("")},dojo.byId('thisFrame').childNodes[pos-sel],'after');
            }else if(c.search('br') != -1){
                dojo.create('br',{},dojo.byId('thisFrame').childNodes[pos-sel],'after');
            }
        }
        
		//Update start / end in mem
        if(pos < por.end) {
            if(pos >= por.start && por.end != por.start)
                ++start;
            ++end;
        }
        if(pos < por.start)
            ++start;
        por.start = start;
        por.end = end;
        this._prevPor.start = this._por.start;
        this._prevPor.end = this._por.end;
		this._moveCaretToPOR();
    };
  
    proto.deleteChar = function(pos) {
		this._updatePOR();
		//clear selection if pos is within current sel
        var t = this._textarea;
        if(pos>=t.value.start && pos<=t.value.end){
            t.clearSelection(null, true);
            this._updatePOR();
        }
        var sel = Math.abs(this._por.start-this._por.end);

		//adjust string in memory
        t.value.string = t.value.string.slice(0, pos).concat(t.value.string.slice(pos+1));
        
		//Fix all remote carets
        for(var j in t.attendees){
            if(pos < t.attendees[j].start)
                --t.attendees[j].start;
        }
		
		//custom render
        if(pos<t.value.start){
            if(dojo.byId('thisFrame').childNodes[pos])
                dojo.destroy(dojo.byId('thisFrame').childNodes[pos]);
        }else{
            if(dojo.byId('thisFrame').childNodes[pos+1-sel])
                dojo.destroy(dojo.byId('thisFrame').childNodes[pos+1-sel]);
        }
		
		//adjust start / end in memory
        if(pos < this._por.start)
            --this._por.start;
        if(pos < this._por.end)
            --this._por.end;
        this._prevPor.start = this._por.start;
        this._prevPor.end = this._por.end;
		this._moveCaretToPOR();
    };
        
    proto.updateChar = function(c, pos, filter) {
		this._updatePOR();
        var t = this._textarea;
        if(pos>=t.value.start && pos<=t.value.end){
            t.clearSelection(null, true);
            this._updatePOR();
        }
        var sel = Math.abs(this._por.start-this._por.end);
        var f = (filter == null || undefined) ? [] : filter;
        t.value.string = t.value.string.slice(0, pos).concat([c]).concat(t.value.string.slice(pos+1));
        
        var ch;
        if(pos<t.value.start){
            dojo.destroy(dojo.byId('thisFrame').childNodes[pos]);
            if((c.search('">') != -1)||(c.search("nbsp") != -1)){
                ch = (c.search("nbsp") == -1) ? c.substring(c.search('">')+2,c.search('">')+3) : '&nbsp; ';
                dojo.create('span',{innerHTML:ch,style:f.join("")},dojo.byId('thisFrame').childNodes[pos-1],'after');
            }else if(c.search('br') != -1){
                dojo.create('br',{},dojo.byId('thisFrame').childNodes[pos-1],'after');
            }
        }else{
            dojo.destroy(dojo.byId('thisFrame').childNodes[pos+1-sel]);
            if((c.search('">') != -1)||(c.search("nbsp") != -1)){
                ch = (c.search("nbsp") == -1) ? c.substring(c.search('">')+2,c.search('">')+3) : '&nbsp; ';
                dojo.create('span',{innerHTML:ch,style:f.join("")},dojo.byId('thisFrame').childNodes[pos-sel],'after');
            }else if(c.search('br') != -1){
                dojo.create('br',{},dojo.byId('thisFrame').childNodes[pos-sel],'after');
            }
        }
        
        this._prevPor.start = this._por.start;
        this._prevPor.end = this._por.end;
		this._moveCaretToPOR();
    };

    proto.insertString = function(string, pos) {
        var x = pos;
        for(var i=0; i<string.length; i++){
            this.insertChar(string[i], x);
            x++;
        }
    };
    
    proto.deleteString = function(start, end) {
        for(var i=start; i<end; i++)
            this.deleteChar(i);
    };
    
    proto.snapshot = function(){
        return this._getValueAttr();
    };
    
    proto.setPOR = function(pos){
        this._por.start = pos;
        this._por.end = pos;
    };
    
    proto.cleanup = function() {
        if(this.t != null){
            clearTimeout(this.t);
            this. t = null;
        }
    };
    
    proto.onStateRequest = function(token){
		var carets = dojo.clone(this._textarea.attendees);
		carets[this._attendeeList.site] = {
            start: this._textarea.value.start,
            end: this._textarea.value.end,
            color: this._attendeeList.attendees[this._attendeeList.site]['color']
        };
        var state = {
            value: this._textarea.value,
            oldSnapshot: this.oldSnapshot,
            history : this._textarea.slider.history,
            title: this._textarea.title,
            attendees: this._attendeeList.attendees,
			carets: carets
        };
        this.collab.sendStateResponse(state,token);
    };
    
    proto.onStateResponse = function(obj){
        this.oldSnapshot = obj.oldSnapshot;
        this._textarea.value = obj.value;
        this._textarea.title = obj.title;
        this._textarea._title.value = this._textarea.title;
        this._textarea.value.start = 0;
        this._textarea.value.end = 0;
        this._textarea.render();
        this._textarea.slider.history = obj.history;
        for(var i in obj.attendees){
            var o = {
                value: {
                    'site':i,
                    'name':obj.attendees[i]['name'],
                    'color':obj.attendees[i]['color']
                }
            };
            this._attendeeList.onRemoteUserJoin(o);
        }
		this._textarea.attendees = obj.carets;
		this._textarea._renderRemoteCarets();
    };
    
    proto._moveCaretToPOR = function() {
        this._textarea.value.start = this._por.start;
        this._textarea.value.end = this._por.end;
        
    };

    proto._updatePOR = function() {
		
        this._por.start = this._textarea.value.start;
        this._por.end = this._textarea.value.end;
        
        if(this._por.start < this.min)
            this.min = this._por.start;
        if(this._por.end > this.max)
            this.max = this._por.end;
		
    };
    
    proto._forcePOR = function() {
        this._por.start = this._textarea.value.start;
        this._por.end = this._textarea.value.end;
        this.min = this._por.start;
        this.max = this._por.end;
    };
    
    proto._connectSyncs = function(){
        this.collab = coweb.initCollab({id : this.id});  
        this.collab.subscribeReady(this,'onCollabReady');
        this.collab.subscribeSync('editorUpdate', this, 'onRemoteChange');
        this.collab.subscribeSync('editorCaret', this, 'onRemoteCaretMove');
        this.collab.subscribeStateRequest(this, 'onStateRequest');
    	this.collab.subscribeStateResponse(this, 'onStateResponse');
    	dojo.connect(dojo.byId('thisDiv'), 'onkeypress', this, '_updatePOR');
    	dojo.connect(dojo.byId('thiDiv'), 'onmouseup', this, '_forcePOR');
    	//AttendeeList connects
    	attendance.subscribeChange(this, 'onUserChange');
    };

    proto._getValueAttr = function() {
        return this._textarea.getValue();
    };
    
    proto._getCleanValueAttr = function(){
        var value = this._getValueAttr();
        var s = [];
        for(var i=0; i<value.length; i++){
            if(value[i]=='^'){
                s.push('<br>');
            }else{
                s.push(value[i]);
            }
        }
        var string = s.join("");
        return string;
    };
    
    return TextEditor;
});