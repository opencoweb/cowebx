define(['coweb/main','./ld'], function(coweb,ld) {
    var TextEditor = function(args){
        this.load_template('../lib/cowebx/dojo/BasicTextareaEditor/textarea.css');
        this.id = args.id;
        this.listen = args.listen;
        if(!this.go)
            this.go = true;
        if(!this.id)
            throw new Error('missing id argument');
    
        this._por = {start : 0, end: 0};
        this._textarea = dojo.create('textarea', {'class':'textarea'}, args.domNode);
        this.oldSnapshot = this.snapshot();
        this.newSnapshot = null;
        this.t = null;
        this.q = [];
        this.min = 0; 
        this.max = 0;
        this.value = '';
        this.shareShowing = false;
        this._buildShareButton();
    
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

    proto._moveCaretToPOR = function() {
        if(this._focused) {
            this._textarea.setSelectionRange(this._por.start, this._por.end);
        }
    };
    
    proto.setPOR = function(pos){
        this._por.start = pos;
        this._por.end = pos;
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
    
    proto._buildShareButton = function() {
        var a = dojo.create('a',{innerHTML:'share', 'class':'share', id:'shareButton'}, this._textarea, 'before');
        dojo.connect(a, 'onclick', this, 'onShareClick');
        var b = dojo.create('div',{innerHTML:'email to send to:<br>','class':'emailBox',id:'sendBox'},this._textarea,'before');
        var c = dojo.create('input',{type:'text',id:'sendInput'},b,'last');
        var d = dojo.create('a',{innerHTML:'send', 'class':'send'}, c, 'after');
        dojo.connect(d, 'onclick', this, 'onSendClick');
    };
    
    proto.onShareClick = function(e) {
        if(this.shareShowing == false){
            this.shareShowing = true;
            dojo.fadeIn({node:'sendBox'}).play();
        }else{
            dojo.fadeOut({node:'sendBox'}).play();
        }
    };
    
    proto.onSendClick = function(e) {
        var email = dojo.byId('sendInput').value;
        if(email != ''){
            var username = 'Username=opencoweb';
            var password = '&Password=777132XK';
            var fromName = '&FromName=OpenCoweb';
            var fromEmail = '&FromEmail=opencoweb@us.ibm.com';
            var toEmail = '&ToEmailAddress='+email;
            var subject = '&Subject=OpenCoweb Document';
            var messagePlain = '&MessagePlain=';
            var messageHTML = '&MessageHTML='+this.formatShareMsg();
            var options = '&Options=';
            var base = 'http://api.jangomail.com/api.asmx/SendTransactionalEmail?';
            this.load_script(base+username+password+fromName+fromEmail+toEmail+subject+messagePlain+messageHTML+options);
            dojo.fadeOut({node:'sendBox'}).play();
        }
    };
    
    proto.formatShareMsg = function(){
        var date = new Date();
        
        var title = '<strong><span style="font-size:14px">OpenCoweb Document</span><br><br>';
        var time = 'Shared at:<br></strong>'+date+'<br><br>';
        var doc = '<strong>Document:<br></strong>'+this.snapshot();
        return title+time+doc;
    };
    
    proto.load_template = function(url) {
       var e = document.createElement("link");
       e.href = url;
       e.type = "text/css";
       e.rel = "stylesheet";
       e.media = "screen";
       document.getElementsByTagName("head")[0].appendChild(e);
    };
    
    proto.load_script = function(url) {
        var script_id = null;
        var script = document.createElement('script');
        script.setAttribute('type', 'text/javascript');
        script.setAttribute('src', url);
        script.setAttribute('id', 'script_id');

        script_id = document.getElementById('script_id');
        if(script_id){
            document.getElementsByTagName('head')[0].removeChild(script_id);
        }

        // Insert <script> into DOM
        document.getElementsByTagName('head')[0].appendChild(script);
    };
    
    

    return TextEditor;
});