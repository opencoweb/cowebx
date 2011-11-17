define([
    'dojo',
	"dojo/_base/declare", // declare
	"dijit/_Widget",
	"dijit/_TemplatedMixin",
	"dijit/_Contained",
	"dojo/text!./TextEditor.html",
	'coweb/main',
    './ld',
    './AttendeeList',
    'coweb/ext/attendance',
    'dijit/layout/ContentPane',
    'dijit/layout/BorderContainer',
    'dojox/mobile/parser'
], function(dojo, declare, _Widget, _TemplatedMixin, _Contained, template, coweb, ld, AttendeeList, attendance,parser){

	return declare("TextEditor", [_Widget, _TemplatedMixin, _Contained], {
	    // widget template
		templateString: template,
		
        postCreate: function(){
			//1. Process args
	        this.id = 'TextEditor';
	        this.go = true;

	        //2. Build stuff
	        dojo.create('textarea', {style:'width:100%;height:100%;'}, dojo.byId('divContainer'));
	        this._attendeeList = new AttendeeList({domNode:dojo.byId('listContainer'), id:'_attendeeList'});
            this.util = new ld({});
	        nicEditors.allTextAreas();
            this._textarea = dojo.query('.nicEdit-main')[0];
            this._toolbar = dojo.query('.nicEdit-panel')[0];
            this.style();
            
            //3. parameters
            this.oldSnapshot = this.snapshot();
            this.newSnapshot = null;
            this.t = null;
            this.q = [];
            this.value = '';
            this.interval = 100;
            this._por = {start : 0, end: 0};
           
            //4. connect
            this.connect();
   
            if(this.go == true)
               this.listenInit();
		},
		
		onCollabReady : function(){
	        this.collab.pauseSync();
	    },

	    listenInit : function(){
	        this.collab.pauseSync();
	        this.t = setTimeout(dojo.hitch(this, 'iterate'), this.interval);
	    },

	    iterate : function() { 
	        this.iterateSend();
	        this.iterateRecv();
	    },

	    iterateSend : function() {
	        this.newSnapshot = this.snapshot();
	        if(this.oldSnapshot && this.newSnapshot){
	            if(this.oldSnapshot != this.newSnapshot)
	                var syncs = this.util.ld(this.oldSnapshot, this.newSnapshot);
	            //Send syncs
	            if(syncs){
	                this.fix(syncs);

	                console.log('syncs sent = ',syncs);
	                for(var i=0; i<syncs.length; i++){
	                    if(syncs[i] != undefined){
	                       this.collab.sendSync('editorUpdate', syncs[i].ch, syncs[i].ty, syncs[i].pos);
	                    }
	                }
	            }
	        }
	    },

	    fix : function(arr){

	    },

	    iterateRecv : function() {
	        this.collab.resumeSync();
	        this.collab.pauseSync();
	        if(this.q.length != 0)
	            this.runOps();
	        this.q = [];
	        this.oldSnapshot = this.snapshot();
	        this.t = setTimeout(dojo.hitch(this, 'iterate'), this.interval);
	    },

	    onRemoteChange : function(obj){
	        this.q.push(obj);
	    },

	    onUserChange : function(params) {
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
	    },

	    runOps : function(){
	        console.log(this.q);
	        this.value = this._textarea.innerHTML;
	        console.log('before = ',this.value);
	        this._updatePOR();
	        for(var i=0; i<this.q.length; i++){
	            if(this.q[i].type == 'insert')
	                this.insertChar(this.q[i].value, this.q[i].position);
	            if(this.q[i].type == 'delete')
	                this.deleteChar(this.q[i].position);
	            if(this.q[i].type == 'update')
	                this.updateChar(this.q[i].value, this.q[i].position);
	        }
	        console.log('after = ',this.value);
	        this._textarea.innerHTML = this.value;
	        this._moveCaretToPOR();
	    },

	    insertChar : function(c, pos) {
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
	    },

	    insertString : function(string, pos) {
	        var x = pos;
	        for(var i=0; i<string.length; i++){
	            this.insertChar(string[i], x);
	            x++;
	        }
	    },

	    deleteString : function(start, end) {
	        for(var i=start; i<end; i++){
	            this.deleteChar(i);
	        }
	    },

	    deleteChar : function(pos) {
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
	    },

	    updateChar : function(c, pos) {
	        //this._updatePOR();
	        var t = this._textarea;
	        //t.value = t.value.substr(0, pos) + c + t.value.substr(pos+1);
	        this.value = this.value.substr(0, pos) + c + this.value.substr(pos+1);
	    },

	    snapshot : function(){
	        return this._getValueAttr();
	    },

	    _getValueAttr : function() {
	        return this._textarea.innerHTML;
	    },

	    _moveCaretToPOR : function() {
	        if(this._focused) {
	            //this._textarea.setSelectionRange(this._por.start, this._por.end);
	        }
	    },

	    _updatePOR : function(e) {
	        if(this._focused) {
	            var t = e ? e.target : this._textarea;
	            this._por.start = t.selectionStart;
	            this._por.end = t.selectionEnd;
	        }
	    },

	    setPOR : function(pos){
	        this._por.start = pos;
	        this._por.end = pos;
	    },

	    _onFocus : function(event) {
	        this._focused = true;
	        var self = this;
	        setTimeout(function() {
	            self._moveCaretToPOR();
	        },0);
	    },

	    _onBlur : function(event) {
	        this._focused = false;
	    },

	    cleanup : function() {
	        if(this.t != null){
	            clearTimeout(this.t);
	            this. t = null;
	        }
	    },

	    onStateRequest : function(token){
	        var state = {
	            snapshot: this.newSnapshot,
	            attendees: this._attendeeList.attendees
	        };
	        this.collab.sendStateResponse(state,token);
	    },

	    onStateResponse : function(obj){
	       // this._textarea.innerHTML = obj.snapshot;
	        this.newSnapshot = obj.snapshot;
	        this.oldSnapshot = obj.snapshot;
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
	    },

	    connect : function(){
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
	        attendance.subscribeChange(this, 'onUserChange');
	    },

	    _loadTemplate : function(url) {
	        var e = document.createElement("link");
	        e.href = url;
	        e.type = "text/css";
	        e.rel = "stylesheet";
	        e.media = "screen";
	        document.getElementsByTagName("head")[0].appendChild(e);
	    },
	    
	    style: function(){
	        this._loadTemplate('../lib/cowebx/dojo/BasicTextareaEditor/TextEditor.css');
	        dojo.style(this._textarea.parentNode,'width','100%');
            dojo.style(this._textarea, 'width','100%');
            dojo.style(this._textarea.parentNode,'height','100%');
            dojo.style(this._textarea, 'height','100%');
            dojo.style(this._textarea, 'margin','0px');
            dojo.style(this._toolbar.parentNode.parentNode,'width','100%');
            dojo.style(this._toolbar.parentNode.parentNode,'height','36px');
            dojo.style(this._toolbar.parentNode,'height','36px');
            dojo.style(this._toolbar,'height','36px');
            dojo.style(this._toolbar.parentNode,'width','100%');
            dojo.style(this._toolbar, 'width','100%');
	    }
	});
});
