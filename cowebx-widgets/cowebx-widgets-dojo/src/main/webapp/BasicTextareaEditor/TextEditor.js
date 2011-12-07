define([
    'dojo',
	"dijit/_Widget",
	"dijit/_TemplatedMixin",
	"dijit/_Contained",
	"dojo/text!./TextEditor.html",
	'coweb/main',
	'coweb/ext/attendance',
    './ld',
    './AttendeeList',
    './ShareButton',
    'dijit/layout/ContentPane',
    'dijit/layout/BorderContainer',
	'./rangy/uncompressed/rangy-core',
	'./rangy//uncompressed/rangy-selectionsaverestore'
], function(dojo, _Widget, _TemplatedMixin, _Contained, template, coweb, attendance, ld, AttendeeList, ShareButton){

	return dojo.declare("TextEditor", [_Widget, _TemplatedMixin, _Contained], {
	    // widget template
		templateString: template,
		
        postCreate: function(){
			//1. Process args
            window.foo			= this;
            this.id 			= 'TextEditor';
	        this.go 			= true;
	
	        //2. Build stuff
	        dojo.create('textarea', {style:'width:100%;height:100%;' }, dojo.byId('divContainer'));
			nicEditors.allTextAreas();    
            this._textarea 		= dojo.query('.nicEdit-main')[0];
            this._toolbar 		= dojo.query('.nicEdit-panel')[0];
			this._buildToolbar();                
			this._footer		= this._buildFooter();
	        this._attendeeList 	= new AttendeeList({domNode:dojo.byId('innerList'), id:'_attendeeList'});
            this.util 			= new ld({});
            this._shareButton 	= new ShareButton({
                'domNode':dojo.byId('infoDiv'),
                'listenTo':this._textarea,
                'id':'shareButton',
                'displayButton':false
            });
            
            //3. parameters
            this.oldSnapshot 	= this.snapshot();
            this.newSnapshot 	= null;
            this.t 				= null;
            this.q 				= [];
            this.value 			= '';
            this.interval 		= 100;
			this.title          = 'Untitled Document';

            //4. Style / connect
			this.style();
            this.connect();
   
			//5. kick things off
            if(this.go == true)
               this.listenInit();
		},
		
		onCollabReady : function(){
	        this.collab.pauseSync();
	        this.resize();
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
	                var s = '';
	                for(var i=0; i<syncs.length; i++){
	                    if(syncs[i] != undefined){
	                       this.collab.sendSync('editorUpdate', syncs[i].ch, syncs[i].ty, syncs[i].pos);
	                       s = s+syncs[i].ch;
	                    }
	                }
	            }
	        }
	    },

	    iterateRecv : function() {
	        this.collab.resumeSync();
	        this.collab.pauseSync();
	        if(this.q.length != 0 && !this.hasIncompleteTags(this.q)){
	            this.runOps();
	            this.q = [];
	        }
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
            var sel = rangy.saveSelection();
            this.value = this._textarea.innerHTML;
	        for(var i=0; i<this.q.length; i++){
	            if(this.q[i].type == 'insert')
	                this.insertChar(this.q[i].value, this.q[i].position);
	            if(this.q[i].type == 'delete')
	                this.deleteChar(this.q[i].position);
	            if(this.q[i].type == 'update')
	                this.updateChar(this.q[i].value, this.q[i].position);
	        }
	        this._textarea.innerHTML = this.value;
            rangy.restoreSelection(sel);
	    },

	    insertChar : function(c, pos) {
	        var p = this.fixPos(pos);
	        this.value = this.value.substr(0, p) + c + this.value.substr(p);
	    },

	    deleteChar : function(pos) {
            var p = this.fixPos(pos);
	        this.value = this.value.substr(0, p) + this.value.substr(p+1);
	    },

	    updateChar : function(c, pos) {
            var p = this.fixPos(pos);
	        this.value = this.value.substr(0, p) + c + this.value.substr(p+1);
	    },
	    
	    fixPos: function(pos){
			var search1 = '<span style="line-height: 0; display: none;" id="1sel';
			var search1a = '<span id="1sel';
			var search2 = '<span style="line-height: 0; display: none;" id="2sel';
			var search2a = '<span id="2sel';
			
	        var start = this.value.search(search1);
	        if(start == -1)
	            var start = this.value.search(search1a);
	        if(start != -1){
	            var end = this.value.search(search2)-78;
    	        if(end == -79)
    	            var end = this.value.search(search2a)-78;   
                if(pos>=end){
    	            pos = pos + 156;
    	        }else if(pos>start && pos<end){
    	            pos = pos + 78;
    	        } 
	        }else if(start == -1){
	            var end = this.value.search(search2);
    	        if(end == -1)
    	            var end = this.value.search(search2a);
    	        if(end != -1){
    	            if(pos>=end)
        	            pos = pos + 78;
    	        }
	        }
	        return pos;
	    },
	    
	    clearSelection: function(){
            
	    },
	    
	    hasIncompleteTags : function(arr){
            var openCount = 0;
            var closeCount = 0;
			var ampCount = 0;
			var semiCount = 0;
            for(var i=0; i<arr.length; i++){
                if(arr[i].value == '<')
                    openCount++;
                else if(arr[i].value == '>')
                    closeCount++;
				else if(arr[i].value == '&')
					ampCount++;
				else if(arr[i].value == ';')
					semiCount++;
            }
			if(ampCount>0){
				if(ampCount==semiCount && openCount==closeCount)
					return false;
				else
					return true;
			}else{
				return !(openCount==closeCount);
			}
	    },

	    snapshot : function(){
	        return this._getValue();
	    },
	    
	    connect : function(){
	        this.collab = coweb.initCollab({id : this.id});  
	        this.collab.subscribeReady(this,'onCollabReady');
	        this.collab.subscribeSync('editorUpdate', this, 'onRemoteChange');
			this.collab.subscribeSync('editorTitle', this, '_onRemoteTitle');
	        this.collab.subscribeStateRequest(this, 'onStateRequest');
	    	this.collab.subscribeStateResponse(this, 'onStateResponse');
	        dojo.connect(this._textarea, 'onfocus', this, '_onFocus');
	        dojo.connect(this._textarea, 'onblur', this, '_onBlur');
	        dojo.connect(dojo.byId('url'),'onclick',this,function(e){ this.selectElementContents(e.target) });
            dojo.connect(dojo.byId('url'),'onblur',this,function(e){ e.target.innerHTML = window.location; });
	        dojo.connect(window, 'resize', this, 'resize');
	        // dojo.connect(dojo.byId('saveButton'),'onclick',this,function(e){
	        //     dojo.publish("shareClick", [{}]);
	        // });
	        attendance.subscribeChange(this, 'onUserChange');
	    },

	    onStateRequest : function(token){
	        var state = {
	            snapshot: this.newSnapshot,
	            attendees: this._attendeeList.attendees,
				title: this.title
	        };
	        this.collab.sendStateResponse(state,token);
	    },

	    onStateResponse : function(obj){
	        this._textarea.innerHTML = obj.snapshot;
	        this.newSnapshot = obj.snapshot;
	        this.oldSnapshot = obj.snapshot;    
			this.title = obj.title;
			this._title.value = this.title;
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
 
	    _getValue : function() {
	        return this._textarea.innerHTML;
	    },

	    _onFocus : function(event) {
	        this._focused = true;
	    },

	    _onBlur : function(event) {
	        this._focused = false;
	    },

	    selectElementContents: function(el){
            var range = document.createRange();
            range.selectNodeContents(el);
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        },
         
	    resize: function(){
	        dojo.style(dojo.byId('editorTable'),'height',dojo.byId('editorTable').parentNode.offsetHeight+'px');
	        dojo.style(dojo.byId('innerList'),'height',(dojo.byId('editorTable').parentNode.offsetHeight-dojo.byId('infoDiv').offsetHeight)+'px');
	        dojo.style(dojo.byId('divContainer'),'height',dojo.byId('editorTable').parentNode.offsetHeight+'px');
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
	        //dojo.attr(this._textarea, 'innerHTML', 'To begin, just start click and start <strong>typing</strong>...');
	        this._loadTemplate('../lib/cowebx/dojo/BasicTextareaEditor/TextEditor.css');
	        dojo.addClass(this._textarea.parentNode, 'textareaContainer');
			dojo.addClass(this._textarea, 'textarea'); 
			
            dojo.style(this._toolbar.parentNode.parentNode,'width','100%');
            dojo.style(this._toolbar.parentNode.parentNode,'height','37px'); 
			dojo.style(this._toolbar.parentNode.parentNode,'border','0px');  

            dojo.style(this._toolbar.parentNode,'height','37px');
			dojo.style(this._toolbar.parentNode,'border','0px'); 
			dojo.style(this._toolbar.parentNode,'borderBottom', '1px solid #BBBBBB')   
			
            dojo.style(this._toolbar,'height','37px');
            dojo.style(this._toolbar, 'width','100%');
            dojo.style(this._toolbar, 'margin','0px');
			dojo.style(this._toolbar, 'borderRight', '0px')
			dojo.style(this._toolbar, 'padding-left','30px'); 
           	
			var rulerContainer = dojo.create('div',{'class':'rulerContainer',id:'rulerContainer'},this._toolbar.parentNode,'after');
			var i = dojo.create('img', {src:'../lib/cowebx/dojo/BasicTextareaEditor/images/ruler.png', 'class':'ruler'}, rulerContainer, 'first');
			
            
            dojo.attr('url','innerHTML',window.location);
	    },
	
		_buildFooter: function(){
	        var footerNode = dojo.create('div',{'class':'footer gradient'},dojo.byId('divContainer'),'last');

	        //1. Title box & image
	        var title = dojo.create('input',{'class':'title',value:'Untitled Document',type:'text'},footerNode,'first');
	        var edit = dojo.create('img',{src:'../lib/cowebx/dojo/RichTextEditor/images/pencil.png','class':'editIcon'},title,'after');

	        //2. Connect
	        dojo.connect(title, 'onclick', this, function(e){
	            dojo.style(e.target, 'background', 'white');
	            e.target.value = '';
	        });
	        dojo.connect(title, 'onblur', this, function(e){
	            this.title = (e.target.value.length > 0) ? e.target.value : this.title;
	            e.target.value = this.title;
	            dojo.style(e.target, 'background', '');
	            this.collab.sendSync('editorTitle', {'title':e.target.value}, null);   
	        });
	        dojo.connect(title, 'onkeypress', this, function(e){
	            if(e.keyCode == 13)
	                e.target.blur();
	        });
	        this._title = title;

	        return footerNode;
		}, 
		
		_buildToolbar: function(){
			for(var i=0; i<this._toolbar.childNodes.length; i++){    
				dojo.addClass(this._toolbar.childNodes[i], 'toolbarButton');
				dojo.style(this._toolbar.childNodes[i].firstChild, 'width', '100%');   
				dojo.style(this._toolbar.childNodes[i].firstChild, 'height', '100%');
				dojo.style(this._toolbar.childNodes[i].firstChild.firstChild, 'width', '100%');   
				dojo.style(this._toolbar.childNodes[i].firstChild.firstChild, 'height', '100%');
				dojo.style(this._toolbar.childNodes[i].firstChild.firstChild.firstChild, 'width', '100%');   
				dojo.style(this._toolbar.childNodes[i].firstChild.firstChild.firstChild, 'height', '100%');
				dojo.style(this._toolbar.childNodes[i].firstChild.firstChild.firstChild, 'backgroundPosition', 'center');   
               	switch(i){
	            	case 1:                                              
	                    dojo.style(this._toolbar.childNodes[i].firstChild.firstChild.firstChild, 'background-image', 'url(../lib/cowebx/dojo/BasicTextareaEditor/images/bold.png)');
						break;
					case 2:
					    dojo.style(this._toolbar.childNodes[i].firstChild.firstChild.firstChild, 'background-image', 'url(../lib/cowebx/dojo/BasicTextareaEditor/images/italic.png)');     
						break;
					case 3:   
						dojo.style(this._toolbar.childNodes[i].firstChild.firstChild.firstChild, 'background-image', 'url(../lib/cowebx/dojo/BasicTextareaEditor/images/underline.png)');
						break; 
					case 19:
						dojo.style(this._toolbar.childNodes[i].firstChild.firstChild.firstChild, 'background-image', 'url(../lib/cowebx/dojo/BasicTextareaEditor/images/textColor.png)');
						break; 
					case 20:   
						dojo.style(this._toolbar.childNodes[i].firstChild.firstChild.firstChild, 'background-image', 'url(../lib/cowebx/dojo/BasicTextareaEditor/images/hiliteColor.png)');
						break;      
				
				}
				       
                //TEMPORARY: HIDE UNUSED BUTTONS
                if(i>3 && i<19)
                    dojo.style(this._toolbar.childNodes[i],'display','none');
            }
			dojo.create('div',{'class':'toolbarDiv'},this._toolbar.childNodes[19],'before');  
			var div = dojo.create('div',{'class':'toolbarDiv'},this._toolbar,'first');
			var newPage = dojo.create('div',{'class':'toolbarButtonCustom',style:'background-image:url(../lib/cowebx/dojo/BasicTextareaEditor/images/newpage.png);'},this._toolbar,'first');
			var home = dojo.create('div',{'class':'toolbarButtonCustom',style:'background-image:url(../lib/cowebx/dojo/BasicTextareaEditor/images/home.png);'},this._toolbar,'first');
			var save = dojo.create('div',{'class':'toolbarButtonCustom',style:'background-image:url(../lib/cowebx/dojo/BasicTextareaEditor/images/save.png);'},this._toolbar,'first')         
						         
		},
		
		_onRemoteTitle: function(obj){
	        this.title = obj.value.title;
	        this._title.value = this.title;
	    },
	    
	    cleanup : function() {
	        if(this.t != null){
	            clearTimeout(this.t);
	            this. t = null;
	        }
	    }
	});
});
