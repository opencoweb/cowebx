define([
    'dojo',
    'coweb/main',
    './ld', 
    './textarea',
    'coweb/ext/attendance'
], function(dojo,coweb,ld,textarea,attendance) {
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
        this._util          =   new ld({});
        this.oldSnapshot    =   this.snapshot();
        this.newSnapshot    =   '';
        this.interval       =   100;           //Broadcast interval in ms
        this.t              =   null;           //Handle for timeouts
        this.q              =   [];             //Queue for incoming ops when paused
        this.min            =   0;              //Min caret pos in iteration loop
        this.max            =   0;              //Max caret pos in iteration loop
        this.on             =   true;           //Turn on/off outgoing syncs
        this.value          =   '';
        this._prevPor       =   {start : 0, end: 0};
        this._site          =   null;
        this.sites         =   {};
        
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

            if(oldLength < newLength){
                var mx = this.max+(newLength - oldLength);
                //Paste optimization
                if(newLength-oldLength>50){
                    var text = this.newSnapshot.substring(this.min, mx);
                    for(var i=0; i<text.length; i++)
                        this.collab.sendSync('editorUpdate', {'char':text[i],'filter':[]}, 'insert', i+this.min);
                }else{
                    var syncs = this._util.ld(this.oldSnapshot.substring(this.min, this.max), this.newSnapshot.substring(this.min, mx));
                    if(syncs){
                        for(var i=0; i<syncs.length; i++){
                            if(this._textarea._paste){
                                this.collab.sendSync('editorUpdate', {'char':syncs[i].ch,'filter':[]}, syncs[i].ty, syncs[i].pos+this.min);
                            }else{
                                this.collab.sendSync('editorUpdate', {'char':syncs[i].ch,'filter':this._textarea.filters}, syncs[i].ty, syncs[i].pos+this.min);
                            }
                        }   
                    }
                }
            }else if(newLength < oldLength){
                var mx = this.max+(oldLength-newLength);
                var mn = (this.min-1 > -1) ? this.min-1 : 0;
                var syncs = this._util.ld(this.oldSnapshot.substring(mn, mx), this.newSnapshot.substring(mn, this.max));
                if(syncs){
                    for(var i=0; i<syncs.length; i++){
                        if(this._textarea._paste){
                            this.collab.sendSync('editorUpdate', {'char':syncs[i].ch,'filter':[]}, syncs[i].ty, syncs[i].pos+mn);
                        }else{
                            this.collab.sendSync('editorUpdate', {'char':syncs[i].ch,'filter':this._textarea.filters}, syncs[i].ty, syncs[i].pos+mn);
                        }
                    }
                }
            }else if(newLength == oldLength){
                if(this.oldSnapshot != this.newSnapshot)
                    var syncs = this._util.ld(this.oldSnapshot.substring(this.min, this.max), this.newSnapshot.substring(this.min, this.max));
                if(syncs){
                    for(var i=0; i<syncs.length; i++){
                        if(this._textarea._paste){
                            this.collab.sendSync('editorUpdate', {'char':syncs[i].ch,'filter':[]}, syncs[i].ty, syncs[i].pos+this.min);
                        }else{
                            this.collab.sendSync('editorUpdate', {'char':syncs[i].ch,'filter':this._textarea.filters}, syncs[i].ty, syncs[i].pos+this.min);
                        }
                    }
                }
            }
            
            //Remote Carets
            if(this._por.start != this._prevPor.start){
                this.collab.sendSync('editorCaret', {'start':this._por.start,'end':this._por.end,'site':this._site}, null);
                this._prevPor.start = this._por.start;
                this._prevPor.end = this._por.end;
                console.log('same');
            }
        }
    };
    
    proto.iterateRecv = function() {
        if(this.on == true)
            this.collab.resumeSync();
        this.collab.pauseSync();
        if(this.q.length != 0){
            this.runOps();
            this._textarea._renderLineNumbers();
            dojo.publish("editorHistory", [{save:dojo.clone(this._textarea.value)}]);
        }
        this._textarea._paste = false;
        this.q = [];
        this.oldSnapshot = this.snapshot();
        this._forcePOR();
        this._textarea._renderLineNumbers();
        this.t = setTimeout(dojo.hitch(this, 'iterate'), this.interval);
    };
    
    proto.runOps = function(){
        this.value = this._textarea.value;
        this._updatePOR();
        for(var i=0; i<this.q.length; i++){
            if(this.q[i].type == 'insert')
                this.insertChar(this.q[i].value['char'], this.q[i].position, this.q[i].value['filter']);
            if(this.q[i].type == 'delete')
                this.deleteChar(this.q[i].position);
            if(this.q[i].type == 'update')
                this.updateChar(this.q[i].value['char'], this.q[i].position, this.q[i].value['filter']);
        }
        this._textarea.value = this.value;
        this._moveCaretToPOR();
    };
    
    proto.onRemoteChange = function(obj){
        this.q.push(obj);
    };
    
    proto.onRemoteCaretMove = function(obj){
        console.log(obj.value);
        //1. Query all nodes in doc, remove selection
        var nl = dojo.query("#thisDiv span,#thisDiv br");
        var nlFixed = nl.slice(0, nl.indexOf(dojo.byId('selection'))).concat(nl.slice(nl.indexOf(dojo.byId('selection'))+1,nl.length));
        
    };
    
    proto.onUserJoin = function(users){
        console.log("JOIN");
        //this.sites[obj.site] = '#'+Math.floor(Math.random()*16777215).toString(16);
        //this.sites[obj.site] = obj.username;
        console.log(this.sites);
        //dojo.create('div',{id:obj.site,'class':'remoteSelection'},dojo.byId('thisFrame'),'first');
    };
    
    proto.onUserLeave = function(users){
        //delete this.sites[obj.site];
    };
        
    proto.insertChar = function(c, pos, filter) {
        //1. Adjust string in memory  
        var t = this._textarea;
        if(pos>t.value.start && pos<t.value.end){
            t.clearSelection();
            this._updatePOR();
        }
        var sel = Math.abs(t.value.start-t.value.end);
        por = this._por,
        start = por.start,
        end = por.end;
        var f = (filter == null || undefined) ? [] : filter;
        
        t.value.string = t.value.string.slice(0, pos).concat([{'char':c,'filters':f}]).concat(t.value.string.slice(pos));
        
        //2. custom render
        if(pos<t.value.start){
            if(c == t.newSpace){
                var node = dojo.create('span',{style:f.join(""),innerHTML:'&nbsp; '},dojo.byId('thisFrame').childNodes[pos],'before');
            }else if(c == t.newLine){
                dojo.create('br',{style:f,},dojo.byId('thisFrame').childNodes[pos],'before');
            }else{
                var node = dojo.create('span',{style:f.join(""),innerHTML:c},dojo.byId('thisFrame').childNodes[pos],'before');
            }
        }else{
            if(pos==t.value.start && sel>0){
                if(c == t.newSpace){
                    var node = dojo.create('span',{style:f.join(""),innerHTML:'&nbsp; '},dojo.byId('thisFrame').childNodes[pos],'before');
                }else if(c == t.newLine){
                    dojo.create('br',{style:f},dojo.byId('thisFrame').childNodes[pos],'before');
                }else{
                    var node = dojo.create('span',{style:f.join(""),innerHTML:c},dojo.byId('thisFrame').childNodes[pos],'before');
                }                
            }else{
                if(c == t.newSpace){
                    var node = dojo.create('span',{style:f.join(""),innerHTML:'&nbsp; '},dojo.byId('thisFrame').childNodes[pos-sel],'after');
                }else if(c == t.newLine){
                    dojo.create('br',{style:f},dojo.byId('thisFrame').childNodes[pos-sel],'after');
                }else{
                    var node = dojo.create('span',{style:f.join(""),innerHTML:c},dojo.byId('thisFrame').childNodes[pos-sel],'after');
                }
            }
        }
        this._textarea._scrollWith();
        
        //3. Adjust caret in memory
        if(pos < por.end) {
            if(pos >= por.start && por.end != por.start)
                ++start;
            ++end;
        }
        if(pos < por.start)
            ++start;
        por.start = start;
        por.end = end;
    };
  
    proto.deleteChar = function(pos) {
        //1. Adjust string in memory
        var t = this._textarea;
        if(pos>=t.value.start && pos<=t.value.end){
            t.clearSelection();
            this._updatePOR();
        }
        var sel = Math.abs(this._por.start-this._por.end);

        t.value.string = t.value.string.slice(0, pos).concat(t.value.string.slice(pos+1));
        //2. custom render
        if(pos<t.value.start){
            if(dojo.byId('thisFrame').childNodes[pos])
                dojo.destroy(dojo.byId('thisFrame').childNodes[pos]);
        }else{
            if(dojo.byId('thisFrame').childNodes[pos+1-sel])
                dojo.destroy(dojo.byId('thisFrame').childNodes[pos+1-sel]);   
        }
        this._textarea._scrollWith();
        
        //3. Adjust caret in memory
        if(pos < this._por.start)
            --this._por.start;
        if(pos < this._por.end)
            --this._por.end;
    };
        
    proto.updateChar = function(c, pos, filter) {
        var t = this._textarea;
        if(pos>=t.value.start && pos<=t.value.end){
            t.clearSelection();
            this._updatePOR();
        }
        var sel = Math.abs(this._por.start-this._por.end);
        var f = (filter == null || undefined) ? [] : filter;
        t.value.string = t.value.string.slice(0, pos).concat([{'char':c,'filters':f.join("")}]).concat(t.value.string.slice(pos+1));
        if(pos<t.value.start){
            dojo.byId('thisFrame').childNodes[pos].innerHTML = c;
            dojo.attr(dojo.byId('thisFrame').childNodes[pos], 'style', dojo.attr(dojo.byId('thisFrame').childNodes[pos],'style')+filter.join(""));
        }else{
            dojo.byId('thisFrame').childNodes[pos+1-sel].innerHTML = c;
            dojo.attr(dojo.byId('thisFrame').childNodes[pos], 'style', dojo.attr(dojo.byId('thisFrame').childNodes[pos+1-sel],'style')+filter.join(""));
        }
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
        var state = {
            value: this._textarea.value,
            oldSnapshot: this.oldSnapshot,
            history : this._textarea.slider.history,
            title: this._textarea.title
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
        attendance.subscribeChange(this, function(params){
            if(!params.users[0])
    			return;
    		if(params.type == "join"){
    			this.onUserJoin(params.users);
    		}else if(params.type == "leave"){
    			this.onUserLeave(params.users);
    		}
        });
        this.collab.subscribeStateRequest(this, 'onStateRequest');
    	this.collab.subscribeStateResponse(this, 'onStateResponse');
    	dojo.connect(dojo.byId('thisDiv'), 'onkeypress', this, '_updatePOR');
    	dojo.connect(dojo.byId('thiDiv'), 'onmouseup', this, '_forcePOR');
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