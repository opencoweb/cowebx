//
// Cooperative plain text editor.
//
// Copyright (c) The Dojo Foundation 2011. All Rights Reserved.
//
define(['dojo', 'dijit/_Widget'], function(dojo, _Widget) {
    return dojo.declare('TextEditor', _Widget, {
        postMixInProperties: function() {
            this._por = {start : 0, end: 0};
        },
        
        postCreate: function() {
            this._textarea = dojo.create('textarea', {}, this.domNode);
            // this.connect(this._textarea, 'onmousedown', '_updatePOR');
            // this.connect(this._textarea, 'onmouseup', '_updatePOR');
            // this.connect(this._textarea, 'onmousemove', '_updatePOR');
            // this.connect(this._textarea, 'onkeydown', '_updatePOR');
            // this.connect(this._textarea, 'onkeyup', '_updatePOR');
            this.connect(this._textarea, 'onfocus', '_onFocus');
            this.connect(this._textarea, 'onblur', '_onBlur');
        },
        
        _getValueAttr: function() {
            return this._textarea.value;
        },
        
        insertChar: function(c, pos) {
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
        },
        
        deleteChar: function(pos) {
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
        },
        
        updateChar: function(c, pos) {
            this._updatePOR();
            var t = this._textarea;
            t.value = t.value.substr(0, pos) + c + t.value.substr(pos+1);            
        },

        _moveCaretToPOR: function() {
            if(this._focused) {
                this._textarea.setSelectionRange(this._por.start, this._por.end);
            }
        },
        
        _updatePOR: function(e) {
            if(this._focused) {
                var t = e ? e.target : this._textarea;
                this._por.start = t.selectionStart;
                this._por.end = t.selectionEnd;
            }
        },
        
        _onFocus: function(event) {
            this._focused = true;
            var self = this;
            setTimeout(function() {
                self._moveCaretToPOR();
            },0);
        },
        
        _onBlur: function(event) {
            this._focused = false;
        }
    });
});
