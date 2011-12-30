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
    'dijit/Dialog',
    'dijit/form/ToggleButton',
    'dijit/layout/ContentPane',
    'dijit/layout/BorderContainer'
], function(dojo, _Widget, _TemplatedMixin, _Contained, template, coweb, attendance, ld, AttendeeList, ShareButton, Dialog, ToggleButton){

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
                'id':'shareButton'
            });
            
            //3. parameters
            this.oldSnapshot 	= this.snapshot();
            this.newSnapshot 	= null;
            this.t 				= null;
            this.q 				= [];
            this.value 			= '';
            this.interval		= 100;
			this.title          = 'Untitled Document';
			this._POR			=	{start:0, end:0};
			this._prevPOR		=	{start:0, end:0};

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
	                var syncs = this.syncs.concat(this.util.ld(this.oldSnapshot, this.newSnapshot));
	            if(syncs){
					var s = '';
	                for(var i=0; i<syncs.length; i++){
	                    if(syncs[i] != undefined){
	                       	this.collab.sendSync('editorUpdate', syncs[i].ch, syncs[i].ty, syncs[i].pos);
							s = s+syncs[i].ty+' '+syncs[i].ch+' '+syncs[i].pos+'\n';
	                    }
	                }
					console.log(syncs);
	            }
	        }
	    },

	    iterateRecv : function() {
			//Get local typing syncs
			this.syncs = [];
			this.syncs = this.util.ld(this.newSnapshot, this.snapshot());
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
            this.sel = rangy.saveSelection();
            this.value = this._textarea.innerHTML;
	        for(var i=0; i<this.q.length; i++){
	            if(this.q[i].type == 'insert')
	                this.insertChar(this.q[i].value, this.q[i].position);
	            if(this.q[i].type == 'delete')
	                this.deleteChar(this.q[i].position);
	            if(this.q[i].type == 'update')
	                this.updateChar(this.q[i].value, this.q[i].position);
	        }
			console.log('GOT: ',this.value);
	        this._textarea.innerHTML = this.value;
			if(this.sel)
            	rangy.restoreSelection(this.sel);
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
			
			var markerLength = (dojo.isWebKit) ? 78 : 77;
			
			// get start index
	        var start = this.value.search(search1);
	        if(start == -1)
	            var start = this.value.search(search1a);
	        if(start != -1){
				// get end index and adjust
	            var end = this.value.search(search2);
    	        if(end == -1)
    	            var end = this.value.search(search2a);   
				end = end - markerLength;
				
                if(pos>=end){
    	            pos = pos + (2*markerLength);
    	        }else if(pos>=start && pos<end){
					this.clearSelection();
					this.value = this.value.substr(0,start) + this.value.substr(start+markerLength);
					this.sel = rangy.saveSelection();
    	        } 
	        }else if(start == -1){
	            var end = this.value.search(search2);
    	        if(end == -1)
    	            var end = this.value.search(search2a);
    	        if(end != -1){
    	            if(pos>=end)
        	            pos = pos + markerLength;
    	        }
	        }
	        return pos;
	    },
	    
	    clearSelection: function(){
			this._skipRestore = true;
            var sel, range;
		    if (window.getSelection) {
		        sel = window.getSelection();
		        if (sel.rangeCount) {
		            range = sel.getRangeAt(0);
		            sel.collapse(range.startContainer, range.startOffset);
		        }
		    } else if ( (sel = document.selection) && sel.type == "Text") {
		        range = sel.createRange();
		        range.collapse(true);
		        range.select();
		    }
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
			this._textarea.innerHTML = '';
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
	
		getValue : function() {
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
	        this._loadTemplate('../lib/cowebx/dojo/RichTextEditor/TextEditor.css');
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
			var i = dojo.create('img', {src:'../lib/cowebx/dojo/RichTextEditor/images/ruler.png', 'class':'ruler'}, rulerContainer, 'first');
			
            
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
	                    dojo.style(this._toolbar.childNodes[i].firstChild.firstChild.firstChild, 'background', 'url(../lib/cowebx/dojo/RichTextEditor/images/bold.png)');
						break;
					case 2:
					    dojo.style(this._toolbar.childNodes[i].firstChild.firstChild.firstChild, 'background', 'url(../lib/cowebx/dojo/RichTextEditor/images/italic.png)');     
						break;
					case 3:   
						dojo.style(this._toolbar.childNodes[i].firstChild.firstChild.firstChild, 'background', 'url(../lib/cowebx/dojo/RichTextEditor/images/underline.png)');
						break; 
					case 8:   
						dojo.style(this._toolbar.childNodes[i].firstChild.firstChild.firstChild, 'background', 'url(../lib/cowebx/dojo/RichTextEditor/images/ordered.png)');
						break;
					case 9:   
						dojo.style(this._toolbar.childNodes[i].firstChild.firstChild.firstChild, 'background', 'url(../lib/cowebx/dojo/RichTextEditor/images/unOrdered.png)');
						break;   
					case 10:   
						dojo.attr(this._toolbar.childNodes[i].firstChild.firstChild,'style',	dojo.attr(this._toolbar.childNodes[i].firstChild.firstChild,'style')+'padding: 0px !Important;');
						dojo.attr(this._toolbar.childNodes[i],'style',dojo.attr(this._toolbar.childNodes[i],'style')+'width: 91px !Important;');
						dojo.style(this._toolbar.childNodes[i].firstChild.firstChild.firstChild, 'background', 'url(../lib/cowebx/dojo/RichTextEditor/images/fontSize.png)');
						break;
					case 11:   
						dojo.attr(this._toolbar.childNodes[i].firstChild.firstChild,'style',	dojo.attr(this._toolbar.childNodes[i].firstChild.firstChild,'style')+'padding: 0px !Important;');
						dojo.attr(this._toolbar.childNodes[i],'style',dojo.attr(this._toolbar.childNodes[i],'style')+'width: 91px !Important;');
						dojo.style(this._toolbar.childNodes[i].firstChild.firstChild.firstChild, 'background', 'url(../lib/cowebx/dojo/RichTextEditor/images/fontFace.png)');
						break;
					case 15:
						dojo.style(this._toolbar.childNodes[i].firstChild.firstChild.firstChild, 'background', 'url(../lib/cowebx/dojo/RichTextEditor/images/image.png)');
						break;
					case 19:
						dojo.style(this._toolbar.childNodes[i].firstChild.firstChild.firstChild, 'background', 'url(../lib/cowebx/dojo/RichTextEditor/images/textColor.png)');
						break; 
					case 20:   
						dojo.style(this._toolbar.childNodes[i].firstChild.firstChild.firstChild, 'background', 'url(../lib/cowebx/dojo/RichTextEditor/images/hiliteColor.png)');
						break;      
				
				}
				       
                //TEMPORARY: HIDE UNUSED BUTTONS
                var arr = [4,5,6,7,12,13,14,16,17,18];
				for(var n in arr){
					dojo.style(this._toolbar.childNodes[arr[n]], 'display', 'none');
				}
            }
			dojo.create('div',{'class':'toolbarDiv'},this._toolbar.childNodes[8],'before'); 
			dojo.create('div',{'class':'toolbarDiv'},this._toolbar.childNodes[19],'before');  
			dojo.create('div',{'class':'toolbarDiv'},this._toolbar,'first');
			var redo = dojo.create('div',{'class':'toolbarButtonCustom',style:'background-image:url(../lib/cowebx/dojo/RichTextEditor/images/redo.png);'},this._toolbar,'first');
			var undo = dojo.create('div',{'class':'toolbarButtonCustom',style:'background-image:url(../lib/cowebx/dojo/RichTextEditor/images/undo.png);'},this._toolbar,'first');
			dojo.connect(redo, 'onclick', this, function(){ document.execCommand('redo',"",""); });
			dojo.connect(undo, 'onclick', this, function(){ document.execCommand('undo',"",""); });
			dojo.create('div',{'class':'toolbarDiv'},this._toolbar,'first');
			var newPage = dojo.create('div',{'class':'toolbarButtonCustom',style:'background-image:url(../lib/cowebx/dojo/RichTextEditor/images/newpage.png);'},this._toolbar,'first');
			var home = dojo.create('div',{'class':'toolbarButtonCustom',style:'background-image:url(../lib/cowebx/dojo/RichTextEditor/images/home.png);'},this._toolbar,'first');
			var save = dojo.create('div',{'class':'toolbarButtonCustom',style:'background-image:url(../lib/cowebx/dojo/RichTextEditor/images/save.png);'},this._toolbar,'first');
			dojo.connect(newPage, 'onclick', this, 'onNewPageClick');
			dojo.connect(home, 'onclick', this, 'onHomeClick');
			dojo.connect(save, 'onclick', this, 'onSaveClick');
			this._buildConfirmDialog();		         
		},
		
		onSaveClick: function() {
	         dojo.publish("shareClick", [{}]);
	    },
		
		onHomeClick: function() {
	        dijit.byId('tDialog').set('content', "You may lose data if you are the only user in the current session. Do you really want to go to Home?");
	        dijit.byId('tDialog').show();
	        var one = dojo.connect(dijit.byId('yesButton'),'onClick',this, function(){
	            window.location = window.location.pathname;
	        });
	        var two = dojo.connect(dijit.byId('noButton'),'onClick',this, function(){
	            dijit.byId('tDialog').hide();
	            dojo.disconnect(one);
	            dojo.disconnect(two);
	        });
	        var three = dojo.connect(dijit.byId('tDialog'), 'onHide', this, function(){
	            dojo.disconnect(one);
	            dojo.disconnect(two);
	            dojo.disconnect(three);
	        });
	    },
		
		onNewPageClick: function() {
	        dijit.byId('tDialog').set('content', "You may lose data if you are the only user in the current session. Do you really want to start a new Document?");
	        dijit.byId('tDialog').show();
	        var one = dojo.connect(dijit.byId('yesButton'),'onClick',this, function(){
	            window.location = window.location.pathname+'?'+'session='+Math.floor(Math.random()*10000001);
	            dojo.disconnect(one);
	            dojo.disconnect(two);
	        });
	        var two = dojo.connect(dijit.byId('noButton'),'onClick',this, function(){
	            dijit.byId('tDialog').hide();
	            dojo.disconnect(one);
	            dojo.disconnect(two);
	        });
	        var three = dojo.connect(dijit.byId('tDialog'), 'onHide', this, function(){
	            dojo.disconnect(one);
	            dojo.disconnect(two);
	            dojo.disconnect(three);
	        });
	    },
	
		_buildConfirmDialog: function(){
	        secondDlg = new Dialog({
	            title: "Are you sure?",
	            style: "width: 300px;font:12px arial;",
	            id: 'tDialog'
	        });
	        var h = dojo.create('div',{'style':'margin-left:auto;margin-right:auto;width:80px;margin-bottom:5px'},secondDlg.domNode,'last');
	        var yes = new ToggleButton({
	            label: '<span style="font-family:Arial;font-size:10px;">Yes</span>',
	            showLabel: true,
	            id: 'yesButton'
	        });
	        var no = new ToggleButton({
	            label: '<span style="font-family:Arial;font-size:10px;">No</span>',
	            showLabel: true,
	            id: 'noButton'
	        });
	        dojo.place(yes.domNode, h, 'last');
	        dojo.place(no.domNode, h, 'last');
	        return secondDlg
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
	    },
	
	});
});
