define(['coweb/main','ld'], function(coweb,ld) {
var TextEditor = function(args){
	this.id = args.id;
	if(!this.id)
        throw new Error('missing id argument');
	
	this._por = {start : 0, end: 0};
	this._textarea = dojo.create('textarea', {}, args.domNode);
	this.oldSnapshot = this.snapshot();
	this.newSnapshot = null;
	
	
	this.collab = coweb.initCollab({id : 'dailyscrum'});  
	dojo.connect(this._textarea, 'onmousedown', this, '_updatePOR');
    dojo.connect(this._textarea, 'onmouseup', this, '_updatePOR');
    dojo.connect(this._textarea, 'onmousemove', this, '_updatePOR');
    dojo.connect(this._textarea, 'onkeydown', this, '_updatePOR');
    dojo.connect(this._textarea, 'onkeyup', this, '_updatePOR');
    dojo.connect(this._textarea, 'onfocus', this, '_onFocus');
    dojo.connect(this._textarea, 'onblur', this, '_onBlur');
	this.util = new ld({});
	this.listen();
};
var proto = TextEditor.prototype;

proto.listen = function() {
	console.log(this.oldSnapshot);
	this.collab.pauseSync();
	setInterval(dojo.hitch(this, function(){
		this.newSnapshot = this.snapshot();
		var syncs = this.util.ld(this.newSnapshot, this.oldSnapshot);
		console.log(syncs);
		//Send syncs
		this.collab.resumeSync();
		this.collab.pauseSync();
		this.oldSnapshot = this.snapshot();
	}), 1000);
};
        
    proto.insertChar = function(c, pos) {
		this._updatePOR();
		var t = this._textarea,
		por = this._por,
		start = por.start,
		end = por.end;
		t.value = t.value.substr(0, pos) + c + t.value.substr(pos);
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
		this._moveCaretToPOR();
	};
        
    proto.deleteChar = function(pos) {
		this._updatePOR();
		var t = this._textarea;
		t.value = t.value.substr(0, pos) + t.value.substr(pos+1);
		if(pos < this._por.start) {
			--this._por.start;
		}
		if(pos < this._por.end) {
			--this._por.end;
		}
		this._moveCaretToPOR();
	};
        
	proto.updateChar = function(c, pos) {
		this._updatePOR();
		var t = this._textarea;
		t.value = t.value.substr(0, pos) + c + t.value.substr(pos+1);
	};

	proto.snapshot = function(){
		return this._getValueAttr();
	};

	proto._getValueAttr = function() {
    	return this._textarea.value;
	};

	proto._moveCaretToPOR = function() {
		if(this._focused) {
			this._textarea.setSelectionRange(this._por.start, this._por.end);
		}
	};
        
	proto._updatePOR = function(e) {
		if(this._focused) {
			var t = e ? e.target : this._textarea;
			this._por.start = t.selectionStart;
			this._por.end = t.selectionEnd;
		}
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

	return TextEditor;
});