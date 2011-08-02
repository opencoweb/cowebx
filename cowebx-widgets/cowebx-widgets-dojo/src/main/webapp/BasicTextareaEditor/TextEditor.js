define(['coweb/main','./ld'], function(coweb,ld) {
    console.log('newest');
    var TextEditor = function(args){
        this.id = args.id;
        this.listen = args.listen;
        if(!this.go)
            this.go = true;
        if(!this.id)
            throw new Error('missing id argument');
    
        this._por = {start : 0, end: 0};
        this._textarea = dojo.create('textarea', {style:'position:relative;'}, args.domNode);
        dojo.style(this._textarea, 'width', '100%');
		dojo.style(this._textarea, 'height', '100%');
        this.oldSnapshot = this.snapshot();
        this.newSnapshot = null;
        this.t = null;
        this.q = [];
        this.min = 0; 
        this.max = 0;
        this.value = '';
        
        this.collab = coweb.initCollab({id : this.id});  
        this.collab.subscribeReady(this,'onCollabReady');
        
        this.collab.subscribeSync('editorUpdate', this, 'onRemoteChange');
        this.collab.subscribeStateRequest(this, 'onStateRequest');
        this.collab.subscribeStateResponse(this, 'onStateResponse');
    
        dojo.connect(this._textarea, 'onmousedown', this, '_updatePOR');
        dojo.connect(this._textarea, 'onmouseup', this, '_updatePOR');
        dojo.connect(this._textarea, 'onmousemove', this, '_updatePOR');
        dojo.connect(this._textarea, 'onkeydown', this, '_updatePOR');
        dojo.connect(this._textarea, 'onkeyup', this, '_updatePOR');
        dojo.connect(this._textarea, 'onfocus', this, '_onFocus');
        dojo.connect(this._textarea, 'onblur', this, '_onBlur');
    
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
        this.newSnapshot = this.snapshot();
        var oldLength = this.oldSnapshot.length;
        var newLength = this.newSnapshot.length;
        
        if(oldLength < newLength){
            var mx = this.max+(newLength - oldLength);
            if(this.oldSnapshot != this.newSnapshot)
                var syncs = this.util.ld(this.oldSnapshot.substring(this.min, this.max), this.newSnapshot.substring(this.min, mx));
            //console.log('old = '+this.oldSnapshot.substring(this.min, this.max));
            //console.log('new = '+this.newSnapshot.substring(this.min, mx));
            
            if(syncs){
                //console.log(syncs);
                for(var i=0; i<syncs.length; i++){
                    this.collab.sendSync('editorUpdate', syncs[i].ch, syncs[i].ty, syncs[i].pos+this.min);
                }
            }
            
        }else if(newLength < oldLength){
            var mx = this.max+(oldLength-newLength);
            var mn = (this.min-1 > -1) ? this.min-1 : 0;
            if(this.oldSnapshot != this.newSnapshot)
                var syncs = this.util.ld(this.oldSnapshot.substring(mn, mx), this.newSnapshot.substring(mn, this.max));
            //console.log('old = '+this.oldSnapshot.substring(mn, mx));
            //console.log('new = '+this.newSnapshot.substring(mn, this.max));
            
            if(syncs){
                //console.log(syncs);
                for(var i=0; i<syncs.length; i++){
                    this.collab.sendSync('editorUpdate', syncs[i].ch, syncs[i].ty, syncs[i].pos+mn);
                }
            }
        }
    };
    
    proto.iterateRecv = function() {
        this.collab.resumeSync();
        this.collab.pauseSync();
        if(this.q.length != 0)
            this.runOps();
        this.q = [];
        this.oldSnapshot = this.snapshot();
        this.t = setTimeout(dojo.hitch(this, 'iterate'), 100);
        this.min = this._por.start;
        this.max = this._por.end;
    };
    
    proto._updatePOR = function(e) {
        if(this._focused) {
            var t = e ? e.target : this._textarea;
            this._por.start = t.selectionStart;
            this._por.end = t.selectionEnd;
        }
        
        if(this._por.start < this.min)
            this.min = this._por.start;
        if(this._por.end > this.max)
            this.max = this._por.end;
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
        //this._updatePOR();
        var t = this._textarea,
        por = this._por,
        start = por.start,
        end = por.end;
        //t.value = t.value.substr(0, pos) + c + t.value.substr(pos);
        this.value = this.value.substr(0, pos) + c + this.value.substr(pos);
        if(pos < por.end) {
            if(pos >= por.start && por.end != por.start) {
                ++start;
            }
            ++end;
        }
        if(pos < por.start) {
            ++start;
        }
        por.start = start;
        por.end = end;
        //this._moveCaretToPOR();
    };
    
    proto.insertString = function(string, pos) {
        var x = pos;
        for(var i=0; i<string.length; i++){
            this.insertChar(string[i], x);
            x++;
        }
    };
    
    proto.deleteString = function(start, end) {
        for(var i=start; i<end; i++){
            this.deleteChar(i);
        }
    };
        
    proto.deleteChar = function(pos) {
        //this._updatePOR();
        var t = this._textarea;
        //t.value = t.value.substr(0, pos) + t.value.substr(pos+1);
        this.value = this.value.substr(0, pos) + this.value.substr(pos+1);
        if(pos < this._por.start) {
            --this._por.start;
        }
        if(pos < this._por.end) {
            --this._por.end;
        }
        //this._moveCaretToPOR();
    };
        
    proto.updateChar = function(c, pos) {
        //this._updatePOR();
        var t = this._textarea;
        //t.value = t.value.substr(0, pos) + c + t.value.substr(pos+1);
        this.value = this.value.substr(0, pos) + c + this.value.substr(pos+1);
    };

    proto.snapshot = function(){
        return this._getValueAttr();
    };

    proto._getValueAttr = function() {
        return this._textarea.value;
    };
    
    proto._getCleanValueAttr = function() {
        return this._textarea.value;
    };

    proto._moveCaretToPOR = function() {
        if(this._focused) {
            this._textarea.setSelectionRange(this._por.start, this._por.end);
        }
    };
    
    proto.setPOR = function(pos){
        this._por.start = pos;
        this._por.end = pos;
    };
    
    proto.getNode = function(){
        return this._textarea;
    };
        
    proto._onFocus = function(event) {
        this._focused = true;
        var self = this;
        setTimeout(function() {
            self._moveCaretToPOR();
        },0);
    };
        
    proto._onBlur = function(event) {
        this._focused = false;
    };
    
    proto.cleanup = function() {
        if(this.t != null){
            clearTimeout(this.t);
            this. t = null;
        }
    };
    
    proto.onStateRequest = function(token){
        var state = {snapshot: this.newSnapshot};
        this.collab.sendStateResponse(state,token);
    };
    
    proto.onStateResponse = function(obj){
        this._textarea.value = obj.snapshot;
        this.newSnapshot = obj.snapshot;
        this.oldSnapshot = obj.snapshot;
    };

    return TextEditor;
});