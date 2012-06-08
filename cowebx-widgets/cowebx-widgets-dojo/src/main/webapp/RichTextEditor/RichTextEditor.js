
var DEBUG = false; // TODO remove once Chris's editor changes have been tested/verified.

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
	'./lib/niceEdit/niceEdit-latest',
	'dojo/text!./TextEditor.css',
    'dojo/dom-construct',
	'dojox/mobile/parser',
    'dijit/layout/ContentPane',
    'dijit/layout/BorderContainer',
	'./lib/rangy/uncompressed/rangy-core',
	'./lib/rangy/uncompressed/rangy-selectionsaverestore'
], function(dojo, _Widget, _TemplatedMixin, _Contained, template, coweb, attendance, ld, AttendeeList, ShareButton, Dialog, ToggleButton, nicEditors, css, domConstruct){

    /* Take two strings and determine how many characters they share in both directions. 
       Returns an object with two integers. */
    function determineLdBounds(a, b) {
        // First, figure out how far in each direction the strings match.
        var i;
        var alen = a.length;
        var blen = b.length;
        var alen1 = alen - 1;
        var blen1 = blen - 1;
        var forwards, backwards;
        for (i = 0; i < alen && i < blen && a[i] == b[i]; ++i)
            ; // Continue while the strings match.
        forwards = i;
        for (i = 0; i < alen && i < blen && a[alen1 - i] == b[blen1 - i]; ++i)
            ; // Continue while the strings match.
        backwards = i;

        // If the ranges overlap, scale back the backwards range.
        if (forwards + backwards > alen)
            backwards = alen - forwards;
        if (forwards + backwards > blen)
            backwards = blen - forwards;
        return { fwds : forwards, bwds : backwards};
    }

	return dojo.declare("RichTextEditor", [_Widget, _TemplatedMixin, _Contained], {
	    // widget template
		templateString: template,
		
        //postCreate: function(){
		startup: function(){
			this._loadTemplate(require.toUrl('cowebx/dojo/RichTextEditor/TextEditor.css'));
			rangy.init(); // Sometimes rangy does not get initialized automatically, so this
                          // ensures it is always does get initialized.
		    this.buildEditor();
        	dojo.fadeIn({node:this.editorNode,duration:1000}).play();
		},
		
		buildEditor: function(){
			//1. Process args
			window.foo			= this;
            if(!this.collabID || this.collabID==undefined)
                console.error("RichTextEditor: unique collabID required.");
            this.id 			= this.collabID;
	        this.go 			= true;

	        //2. Build stuff
	        dojo.create('textarea', {style:'width:100%;height:100%;' }, this.divContainerBody);
			nicEditors.nicEditors.allTextAreas();    
            this._textarea 		= dojo.query('.nicEdit-main')[0];
            this._toolbar 		= dojo.query('.nicEdit-panel')[0];
			this._buildToolbar();                
			this._footer		= this._buildFooter();
	        this._attendeeList 	= new AttendeeList({domNode:this.innerList, id:'_attendeeList'});
            this.util 			= new ld({});
            this._shareButton 	= new ShareButton({
                'domNode':this.infoDiv,
                'listenTo':this._textarea,
                'id':'shareButton',
				'displayButton':false
            });
            this.divChecker = domConstruct.create("div");
            
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
            this.firstSpan      = null;
            this.secondSpan     = null;
            this._skipRestore   = false;

            //4. Style / connect
			this._style();
            this.connect();
   
			//5. kick things off
            if(this.go == true)
               this.listenInit();
		},
		
		aquireUrlParams: function(param){
			param = param.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
			var pattern = "[\\?&]"+param+"=([^&#]*)";
			var regex = new RegExp( pattern );
			var results = regex.exec( window.location.href );
			if( results == null )
				return null;
			else
				return results[1];
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

        /* This function transforms the editor HTML into HTML that all major browsers support.
           This is important because iterateRecv will set _textarea.innerHTML, and doing so with
           invalid HTML will lead to a divergence between two client's editor HTML content (i.e.
           the data becomes out of sync).

           This function exists in hopes that one day a perfect implementation will exist. Right now,
           the implementation assumes that if setting innerHTML works without modification on this
           client, it will work on all clients. However, this is likely not 100 percent correct. */
        normalizeHTML : function() {
            var sel = rangy.saveSelection();
            this.divChecker.innerHTML = "";
            this.divChecker.innerHTML = this._textarea.innerHTML;
            this._textarea.innerHTML = this.divChecker.innerHTML;
            if (sel)
                rangy.restoreSelection(sel);
        },

	    iterateSend : function() {
            var syncs, diffs;
            var ldOffset, ldLength;
            var oldSub, newSub;
            var bnds;
	        this.newSnapshot = this.snapshot();
	        if(null !== this.oldSnapshot && null !== this.newSnapshot) {
	            if(this.oldSnapshot != this.newSnapshot) {
                    this.normalizeHTML();
                    this.newSnapshot = this.snapshot();
                    if (this.oldSnapshot != this.newSnapshot) {
                        bnds = determineLdBounds(this.oldSnapshot, this.newSnapshot);
                        oldSub = this.oldSnapshot.substring(bnds.fwds, this.oldSnapshot.length - bnds.bwds);
                        newSub = this.newSnapshot.substring(bnds.fwds, this.newSnapshot.length - bnds.bwds);
                        diffs = this.util.ld_offset(oldSub, newSub, bnds.fwds);
                        syncs = this.syncs.concat(diffs);
                        var tmp1 = 2 * (bnds.fwds + bnds.bwds);
                        var tmp2 = this.oldSnapshot.length + this.newSnapshot.length;
                        if(DEBUG)console.log("ld savings of %d/%d %f", tmp1, tmp2, 1. * tmp1 / tmp2);
                    }
                }
	            if(syncs){
                    if(DEBUG)console.log("WAS=%s",this.oldSnapshot);
                    if(DEBUG)console.log("NOW=%s",this.newSnapshot);
					var s = '';
	                for(var i=0; i<syncs.length; i++){
	                    if(syncs[i] != undefined){
	                       	this.collab.sendSync('editorUpdate', syncs[i].ch, syncs[i].ty, syncs[i].pos);
							s = s+syncs[i].ty+' '+syncs[i].ch+' '+syncs[i].pos+'\n';
	                    }
	                }
                    if(DEBUG)console.log(s);
	            }
	        }
	    },

	    iterateRecv : function() {
			//Get local typing syncs
			this.syncs = [];
            var currentSnap = this.snapshot();
            var bnds, oldSub, newSub, diffs;
            if (this.newSnapshot != currentSnap) {
                bnds = determineLdBounds(this.newSnapshot, currentSnap);
                oldSub = this.oldSnapshot.substring(bnds.fwds, this.newSnapshot.length - bnds.bwds);
                newSub = this.newSnapshot.substring(bnds.fwds, currentSnap.length - bnds.bwds);
                diffs = this.util.ld_offset(oldSub, newSub, bnds.fwds); // Careful with O(n^2) algo.
                this.syncs = this.syncs.concat(diffs);
            }
	        this.collab.resumeSync();
	        this.collab.pauseSync();
            if (this.q.length > 0)
                this.tryUpdate();
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

        removeRangySpans : function()
        {
            var val = this.value;
			var search1 = '<span style="line-height: 0; display: none;" id="1sel';
			var search1a = '<span id="1sel';
			var search2 = '<span style="line-height: 0; display: none;" id="2sel';
			var search2a = '<span id="2sel';
            var start, end;
			var markerLength = (dojo.isWebKit) ? 78 : 77;

            this.firstSpan = null;
            this.secondSpan = null;
            // Non-collapsed?
            var start = val.indexOf(search1);
            if (-1 == start)
                start = val.indexOf(search1a);
            if (-1 != start)
            {
                end = val.indexOf(search2);
                if (-1 == end)
                    end = val.indexOf(search2a);
                if (-1 == end)
                    return;

                // Guaranteed both spans exist.
                if (start > end)
                {
                    var tmp = end;
                    end = start;
                    start = tmp;
                }
                this.firstSpan = {
                    pos : start,
                    text : val.substring(start, start + markerLength),
                    skip : false
                };
                this.secondSpan = {
                    pos : end - markerLength,
                    text : val.substring(end, end + markerLength),
                    skip : false
                };
                // Order is important below!
                this.value = this.value.substring(0, end) + this.value.substring(end + markerLength);
                this.value = this.value.substring(0, start) + this.value.substring(start + markerLength);
            }
            else
            {
                // Collapsed selection.
                end = val.indexOf(search2);
                if (-1 == end)
                    end = val.indexOf(search2a);
                if (-1 == end) {
                    this.first
                    return; 
                }
                // Guaranteed only second span exists.
                this.secondSpan = {
                    pos : end,
                    text : val.substring(end, end + markerLength),
                    skip : false
                };
                this.value = this.value.substring(0, end) + this.value.substring(end + markerLength);
            }

        },

        restoreRangySpan : function(data) {
            if (!data || data.skip)
                return;
            this.value = this.value.substring(0, data.pos) + data.text + this.value.substring(data.pos);
        },

        tryUpdate : function() {
            // Process the queue and check that the changes are valid.
            this.sel = rangy.saveSelection();
            this._skipRestore = false;
            this.value = this._textarea.innerHTML;
            var tmp1, tmp2;
            tmp1 = this.value.indexOf('2selectionBoundary');
            if (tmp1 >= 0)
            {
                tmp2 = this.value.indexOf('2selectionBoundary', tmp1+1);
                if (tmp2 >= 0)
                {
                    console.warn("OOOPS");
                    console.warn("OOOPS");
                }
            }
            if(DEBUG)console.log(this.q);
            if(DEBUG)console.log("before remove");
            if(DEBUG)console.log(this.value);
            /* We will actually remove Rangy's invisible markers, perform the remote operations,
               then add the markers back in. We track remote changes to update the position of the
               markers - this makes performing the operations easier (faster) and removes the bug
               of Rangy's markers invalidating the HTML.
                */
            this.removeRangySpans();
            if(DEBUG)console.log(this.value);
            if(DEBUG)console.log(this.firstSpan);
            if(DEBUG)console.log(this.secondSpan);
	        for(var i=0; i<this.q.length; i++){
	            if(this.q[i].type == 'insert')
	                this.insertChar(this.q[i].value, this.q[i].position);
	            if(this.q[i].type == 'delete')
	                this.deleteChar(this.q[i].position);
	            if(this.q[i].type == 'update')
	                this.updateChar(this.q[i].value, this.q[i].position);
	        }
	        if (!this.willHTMLChange(this.value)) {
                // If HTML is valid, update textarea and clear the queue.
                if(DEBUG)console.log("before restore");
                if(DEBUG)console.log(this.firstSpan);
                if(DEBUG)console.log(this.secondSpan);
                if(DEBUG)console.log(this.value);
                // Order important for below operations!
                if (!this._skipRestore) {
                    this.restoreRangySpan(this.secondSpan);
                    this.restoreRangySpan(this.firstSpan);
                }
                if(DEBUG)console.log(this.value);
                this._textarea.innerHTML = this.value;
                this.q = [];
            } // Else, do nothing and wait for more remote changes.
            if (!this._skipRestore && this.sel)
                rangy.restoreSelection(this.sel);
        },

	    insertChar : function(c, p) {
	        this.fixPos(p, 1);
	        this.value = this.value.substr(0, p) + c + this.value.substr(p);
	    },

	    deleteChar : function(p) {
            this.fixPos(p, -1);
	        this.value = this.value.substr(0, p) + this.value.substr(p+1);
	    },

	    updateChar : function(c, p) {
	        this.value = this.value.substr(0, p) + c + this.value.substr(p+1);
	    },
	    
        fixPos : function(pos, dx) {
            // If either span reach the beginning, clear the selection.

            if (this.firstSpan && pos <= this.firstSpan.pos) {
                this.firstSpan.pos += dx;
                if (0 === this.firstSpan.pos || this.firstSpan.pos >= this.value.length) {
                    console.warn("HAD TO CLEAR");
                    this.clearSelection();
                    this.firstSpan.skip = true;
                }
            }
            if (this.secondSpan && pos < this.secondSpan.pos) { // Off by one half-open interval.
                this.secondSpan.pos += dx;
                if (0 === this.secondSpan.pos || this.secondSpan.pos >= this.value.length) {
                    console.warn("HAD TO CLEAR");
                    this.clearSelection();
                    this.secondSpan.skip = true;
                }
            }

        },

                 // TODO remove me
	    fixPos2: function(pos){
			var search1 = '<span style="line-height: 0; display: none;" id="1sel';
			var search1a = '<span id="1sel';
			var search2 = '<span style="line-height: 0; display: none;" id="2sel';
			var search2a = '<span id="2sel';
			
			var markerLength = (dojo.isWebKit) ? 78 : 77;
			
			// get start index
	        var start = this.value.indexOf(search1);
	        if(start == -1)
	            var start = this.value.indexOf(search1a);
	        if(start != -1){
				// get end index and adjust
	            var end = this.value.indexOf(search2);
    	        if(end == -1)
    	            var end = this.value.indexOf(search2a);   
				end = end - markerLength;
				
                if(pos>=end){
    	            pos = pos + (2*markerLength);
    	        }else if(pos>=start && pos<end){
					this.clearSelection();
					this.value = this.value.substr(0,start) + this.value.substr(start+markerLength);
					this.sel = rangy.saveSelection();
    	        } 
	        }else if(start == -1){
	            var end = this.value.indexOf(search2);
    	        if(end == -1)
    	            var end = this.value.indexOf(search2a);
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
	    
        willHTMLChange : function(html) {
            this.divChecker.innerHTML = "";
            this.divChecker.innerHTML = html;
            if (this.divChecker.innerHTML != html)
                return true; // True if DOM changed the html (i.e. it was malformed).
            else
                return false;
        },

                         // TODO remove me
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
	        dojo.connect(this.url,'onclick',this,function(e){ this.selectElementContents(e.target) });
            dojo.connect(this.url,'onblur',this,function(e){ e.target.innerHTML = window.location; });
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
			dojo.style(this.editorNode,'height',document.body.offsetHeight+'px');
	        dojo.style(this.editorTable,'height',this.editorTable.parentNode.offsetHeight+'px');
	        dojo.style(this.innerList,'height',(this.editorTable.parentNode.offsetHeight-this.infoDiv.offsetHeight)+'px');
	        dojo.style(this.divContainer,'height',this.editorTable.parentNode.offsetHeight+'px');
			dojo.style(this.divContainerBody,'height',(this.editorTable.parentNode.offsetHeight-61)+'px');
	    },

	    _loadTemplate : function(url) {
	        var e = document.createElement("link");
	        e.href = url;
	        e.type = "text/css";
	        e.rel = "stylesheet";
	        e.media = "screen";
	        document.getElementsByTagName("head")[0].appendChild(e);
	    },
	    
	    _style: function(){
	        //dojo.attr(this._textarea, 'innerHTML', 'To begin, just start click and start <strong>typing</strong>...');
	        //this._loadTemplate('../lib/cowebx/dojo/RichTextEditor/TextEditor.css');
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
			dojo.style(this._toolbar, 'padding-left','10px'); 
           	
			var rulerContainer = dojo.create('div',{'class':'rulerContainer',id:'rulerContainer'},this._toolbar.parentNode,'after');
			var i = dojo.create('img', {src:require.toUrl('cowebx/dojo/RichTextEditor/images/ruler.png'), 'class':'ruler'}, rulerContainer, 'first');
			
            
            dojo.attr(this.url,'innerHTML',window.location);
	    },
	
		_buildFooter: function(){
	        var footerNode = dojo.create('div',{'class':'footer gradient'},this.divContainer,'last');

	        //1. Title box & image
	        var title = dojo.create('input',{'class':'title',value:'Untitled Document',type:'text'},footerNode,'first');
	        var edit = dojo.create('img',{src:require.toUrl('cowebx/dojo/RichTextEditor/images/pencil.png'),'class':'editIcon'},title,'after');

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
			dojo.place(this._toolbar.parentNode.parentNode, this.divContainer,'first');
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
	                    dojo.style(this._toolbar.childNodes[i].firstChild.firstChild.firstChild, 'background', 'url('+require.toUrl('cowebx/dojo/RichTextEditor/images/bold.png')+')');
						break;
					case 2:
					    dojo.style(this._toolbar.childNodes[i].firstChild.firstChild.firstChild, 'background', 'url('+require.toUrl('cowebx/dojo/RichTextEditor/images/italic.png')+')');     
						break;
					case 3:   
						dojo.style(this._toolbar.childNodes[i].firstChild.firstChild.firstChild, 'background', 'url('+require.toUrl('cowebx/dojo/RichTextEditor/images/underline.png')+')');
						break; 
					case 8:   
						dojo.style(this._toolbar.childNodes[i].firstChild.firstChild.firstChild, 'background', 'url('+require.toUrl('cowebx/dojo/RichTextEditor/images/ordered.png')+')');
						break;
					case 9:   
						dojo.style(this._toolbar.childNodes[i].firstChild.firstChild.firstChild, 'background', 'url('+require.toUrl('cowebx/dojo/RichTextEditor/images/unOrdered.png')+')');
						break;   
					case 10:   
						dojo.attr(this._toolbar.childNodes[i].firstChild.firstChild,'style',	dojo.attr(this._toolbar.childNodes[i].firstChild.firstChild,'style')+'padding: 0px !Important;');
						dojo.attr(this._toolbar.childNodes[i],'style',dojo.attr(this._toolbar.childNodes[i],'style')+'width: 91px !Important;');
						dojo.style(this._toolbar.childNodes[i].firstChild.firstChild.firstChild, 'background', 'url('+require.toUrl('cowebx/dojo/RichTextEditor/images/fontSize.png')+')');
						break;
					case 11:   
						dojo.attr(this._toolbar.childNodes[i].firstChild.firstChild,'style',	dojo.attr(this._toolbar.childNodes[i].firstChild.firstChild,'style')+'padding: 0px !Important;');
						dojo.attr(this._toolbar.childNodes[i],'style',dojo.attr(this._toolbar.childNodes[i],'style')+'width: 91px !Important;');
						dojo.style(this._toolbar.childNodes[i].firstChild.firstChild.firstChild, 'background', 'url('+require.toUrl('cowebx/dojo/RichTextEditor/images/fontFace.png')+')');
						break;
					case 15:
						dojo.style(this._toolbar.childNodes[i].firstChild.firstChild.firstChild, 'background', 'url('+require.toUrl('cowebx/dojo/RichTextEditor/images/image.png')+')');
						break;
					case 19:
						dojo.style(this._toolbar.childNodes[i].firstChild.firstChild.firstChild, 'background', 'url('+require.toUrl('cowebx/dojo/RichTextEditor/images/textColor.png')+')');
						break; 
					case 20:   
						dojo.style(this._toolbar.childNodes[i].firstChild.firstChild.firstChild, 'background', 'url('+require.toUrl('cowebx/dojo/RichTextEditor/images/hiliteColor.png')+')');
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
			var redo = dojo.create('div',{'class':'toolbarButtonCustom',style:'background-image:url('+require.toUrl('cowebx/dojo/RichTextEditor/images/redo.png')+');'},this._toolbar,'first');
			var undo = dojo.create('div',{'class':'toolbarButtonCustom',style:'background-image:url('+require.toUrl('cowebx/dojo/RichTextEditor/images/undo.png')+');'},this._toolbar,'first');
			dojo.connect(redo, 'onclick', this, function(){ document.execCommand('redo',"",""); });
			dojo.connect(undo, 'onclick', this, function(){ document.execCommand('undo',"",""); });
			dojo.create('div',{'class':'toolbarDiv'},this._toolbar,'first');
			var save = dojo.create('div',{'class':'toolbarButtonCustom',style:'background-image:url('+require.toUrl('cowebx/dojo/RichTextEditor/images/save.png')+');'},this._toolbar,'first');
			dojo.connect(save, 'onclick', this, 'onSaveClick');
			this._buildConfirmDialog();		         
		},
		
		onSaveClick: function() {
	         dojo.publish("shareClick", [{}]);
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
	    }
	});
});

// TODO remove me
function curVal()
{
     return dojo.query(".nicEdit-main")[0].innerHTML;
}

