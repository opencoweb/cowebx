define(['coweb/main','./ld', './textarea', './TimeSlider'], function(coweb,ld,textarea,Slider) {
    var TextEditor = function(args){
        this.id = args.id;
        this.listen = args.listen;
        if(!this.go)
            this.go = true;
        if(!this.id)
            throw new Error('missing id argument');
    
        this._por = {start : 0, end: 0};
        this._container = dojo.create('div',{'class':'container'},args.domNode);
        this._textarea = new textarea({domNode:this._container,'id':'_textarea'});
        this.oldSnapshot = this.snapshot();
        this.newSnapshot = '';
        this.t = null;
        this.buffer = [];
        this.q = [];
        this.min = 0; 
        this.max = 0;
        this.value = '';
        this.on = true;
        this.slider = this._buildSlider();
        this._connectSyncs();
        dojo.connect(this._textarea.div, 'onkeypress', this, '_updatePOR');
    
    
        this.util = new ld({});

        if(this.go == true)
            this.listenInit();
    };
    var proto = TextEditor.prototype;
    
    proto.onCollabReady = function(){
        this.collab.pauseSync();
    };

    proto.listenInit = function(){
        this.collab.pauseSync();
        this.t = setTimeout(dojo.hitch(this, 'iterate'), 100);
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
                if(this.oldSnapshot != this.newSnapshot)
                    var syncs = this.util.ld(this.oldSnapshot.substring(this.min, this.max), this.newSnapshot.substring(this.min, mx));

                if(syncs){
                    //console.log(syncs);
                    for(var i=0; i<syncs.length; i++){
                        this.collab.sendSync('editorBuffer', {buffer:this._textarea.filters});
                        this.collab.sendSync('editorUpdate', syncs[i].ch, syncs[i].ty, syncs[i].pos+this.min);
                    }
                    
                }
            }else if(newLength < oldLength){
                var mx = this.max+(oldLength-newLength);
                var mn = (this.min-1 > -1) ? this.min-1 : 0;
                if(this.oldSnapshot != this.newSnapshot)
                    var syncs = this.util.ld(this.oldSnapshot.substring(mn, mx), this.newSnapshot.substring(mn, this.max));

                if(syncs){
                    //console.log(syncs);
                    for(var i=0; i<syncs.length; i++){
                        this.collab.sendSync('editorBuffer', {buffer:this._textarea.filters});
                        this.collab.sendSync('editorUpdate', syncs[i].ch, syncs[i].ty, syncs[i].pos+mn);
                    }
                }
            }else if(newLength == oldLength){
                if(this.oldSnapshot != this.newSnapshot)
                    var syncs = this.util.ld(this.oldSnapshot.substring(this.min, this.max), this.newSnapshot.substring(this.min, this.max));

                if(syncs){
                    //console.log(syncs);
                    for(var i=0; i<syncs.length; i++){
                        this.collab.sendSync('editorBuffer', {buffer:this._textarea.filters});
                        this.collab.sendSync('editorUpdate', syncs[i].ch, syncs[i].ty, syncs[i].pos+this.min);
                    }
                }
            }
        }
    };
    
    proto.iterateRecv = function() {
        if(this.on == true)
            this.collab.resumeSync();
        this.collab.pauseSync();
        if(this.q.length != 0){
            this.runOps();
            this._textarea.getCharObj();
        }
        this.q = [];
        this.oldSnapshot = this.snapshot();
        this.min = this._por.start;
        this.max = this._por.end;
        this.t = setTimeout(dojo.hitch(this, 'iterate'), 100);
    };
    
    proto.onRemoteChange = function(obj){
        this.q.push(obj);
    };
    
    proto.runOps = function(){
        this.value = this._textarea.value;
        this._updatePOR();
        for(var i=0; i<this.q.length; i++){
            if(this.q[i].type == 'insert')
                this.insertChar(this.q[i].value, this.q[i].position);
            if(this.q[i].type == 'delete')
                this.deleteChar(this.q[i].position);
            if(this.q[i].type == 'update')
                this.updateChar(this.q[i].value, this.q[i].position);
        }
        this._textarea.value = this.value;
        this._moveCaretToPOR();
    };
        
    proto.insertChar = function(c, pos) {
        var t = this._textarea,
        por = this._por,
        start = por.start,
        end = por.end;
        var f = this.buffer.slice();
        t.value.string = t.value.string.slice(0, pos).concat([{'char':c,'filters':f}]).concat(t.value.string.slice(pos));
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
        
    proto.deleteChar = function(pos) {
        var t = this._textarea;
        t.value.string = t.value.string.slice(0, pos).concat(t.value.string.slice(pos+1));
        if(pos < this._por.start)
            --this._por.start;
        if(pos < this._por.end)
            --this._por.end;
    };
        
    proto.updateChar = function(c, pos) {
        var t = this._textarea;
        t.value.string = t.value.string.slice(0, pos).concat([{'char':c,'filters':[]}]).concat(t.value.string.slice(pos+1));
    };

    proto.snapshot = function(){
        return this._getValueAttr();
    };
    
    proto.setPOR = function(pos){
        this._por.start = pos;
        this._por.end = pos;
    };
    
    proto.getNode = function(){
        return this._textarea.div;
    };
    
    proto.cleanup = function() {
        if(this.t != null){
            clearTimeout(this.t);
            this. t = null;
        }
    };
    
    proto.onStateRequest = function(token){
        var state = {
            string: this._textarea.value.string,
            oldSnapshot: this.oldSnapshot,
            history : this.slider.history,
            title: this._textarea.title
        };
        this.collab.sendStateResponse(state,token);
    };
    
    proto.onStateResponse = function(obj){
        this.oldSnapshot = obj.oldSnapshot;
        this._textarea.value.string = obj.string;
        this._textarea.title = obj.title;
        this._textarea._title.innerHTML = this._textarea.title;
        this._textarea.render();
        this._textarea.getCharObj(true);
        this.slider.history = obj.history;
    };
    
    proto.onRemoteBuffer = function(obj){
        this.buffer = obj.value.buffer;
    };
    
    proto._updatePOR = function() {
        this._por.start = this._textarea.value.start;
        this._por.end = this._textarea.value.end;
        
        if(this._por.start < this.min)
            this.min = this._por.start;
        if(this._por.end > this.max)
            this.max = this._por.end;
    };
    
    proto._connectSyncs = function(){
        this.collab = coweb.initCollab({id : this.id});  
        this.collab.subscribeReady(this,'onCollabReady');
        this.collab.subscribeSync('editorUpdate', this, 'onRemoteChange');
        this.collab.subscribeSync('editorBuffer', this, 'onRemoteBuffer');
        this.collab.subscribeStateRequest(this, 'onStateRequest');
    	this.collab.subscribeStateResponse(this, 'onStateResponse');
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

    proto._moveCaretToPOR = function() {
        this._textarea.value.start = this._por.start;
        this._textarea.value.end = this._por.end;
        this._textarea.render();
    };
    
    proto._buildSlider = function() {
        var node = dojo.create('div',{'class':'slider',id:'sliderHolder'},this._textarea.toolbar.domNode,'before');
        var holder = dojo.create('div',{'style':'width:100%;height:100%'},node);
        var slider = new Slider({'domNode':holder,textarea:this._textarea,'id':'slider','parent':this});
        return slider;
    };
    

    return TextEditor;
});