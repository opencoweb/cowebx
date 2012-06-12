define(['coweb/main','./diff_match_patch'], function(coweb) {
    var TextEditor = function(args){
        this.id = args.id;
        this.listen = args.listen;
        if(!this.go)
            this.go = true;
        if(!this.id)
            throw new Error('missing id argument');
    
        this.differ = new diff_match_patch();
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

    proto.doDiff = function(oldS, newS) {
        function convertInsert(q, s, off) {
            var i;
            for (i = 0; i < s.length; ++i)
                q.push({ty:'insert', pos:i+off, ch:s[i]});
        }
        function convertDelete(q, s, off) {
            var i;
            for (i = 0; i < s.length; ++i)
                q.push({ty:'delete', pos:off, ch:null});
        }
        var q, rawDiffs;
        var i = 0, off = 0;

        rawDiffs = this.differ.diff_main(oldS, newS);
        q = [];
        for ( ; i < rawDiffs.length; ++i)
        {
            switch(rawDiffs[i][0]) {
                case 0:
                    off += rawDiffs[i][1].length;
                    break;
                case 1:
                    convertInsert(q, rawDiffs[i][1], off);
                    off += rawDiffs[i][1].length;
                    break;
                case -1:
                    convertDelete(q, rawDiffs[i][1], off);
                    break;
            }
        }
        return q;
    };
    
    proto.iterateSend = function() {
        var syncs = null;
        this.newSnapshot = this.snapshot();
        var oldLength = this.oldSnapshot.length;
        var newLength = this.newSnapshot.length;

        if (this.oldSnapshot != this.newSnapshot) {
            syncs = this.syncs.concat(this.doDiff(this.oldSnapshot, this.newSnapshot));
            if (syncs){
                for(var i=0; i<syncs.length; i++){
                    this.collab.sendSync('editorUpdate', syncs[i].ch, syncs[i].ty, syncs[i].pos);
                }
            }
        }
    };
    
    proto.iterateRecv = function() {
		this.syncs = [];
		this.syncs = this.doDiff(this.newSnapshot, this.snapshot());
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

	proto.getValue = function(){
		return this._textarea.value;
	};

    return TextEditor;
});
