
// TODO remove once Chris's changes are tested.
var DEBUG = false;
function curVal() { return dojo.query(".nicEdit-main")[0].innerHTML; }

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
	'./lib/rangy/uncompressed/rangy-selectionsaverestore',
    './lib/diff_match_patch'
], function(dojo, _Widget, _TemplatedMixin, _Contained, template, coweb, attendance, ld, AttendeeList, ShareButton, Dialog, ToggleButton, nicEditors, css, domConstruct){

    /* Take two strings and determine how many characters they share in both directions. 
       Returns an object with two integers.  TODO keep this as long as we keep doDiff_ld. */
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
            this.differ = new diff_match_patch();
            
            //3. parameters
            this.syncs          = [];
            this.oldSnapshot 	= this.snapshot();
            this.newSnapshot 	= null;
            this.t 				= null;
            this.q 				= [];
            this.value 			= '';
            this.valueNoRangy   = '';
            this.interval		= 1000;
			this.title          = 'Untitled Document';
			this._POR			=	{start:0, end:0};
			this._prevPOR		=	{start:0, end:0};
            this.firstSpan      = null;
            this.secondSpan     = null;
            this._skipRestore   = false;
            this.doDiff         = this.doDiff_fast;

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

        doDiff_ld : function(oldS, newS) {
            // Optimization: don't examine common prefix and suffix.
            var bnds, subA, subB, diffs;
            bnds = determineLdBounds(oldS, newS);
            oldSub = oldS.substring(bnds.fwds, oldS.length - bnds.bwds);
            newSub = newS.substring(bnds.fwds, newS.length - bnds.bwds);
            diffs = this.util.ld_offset(oldSub, newSub, bnds.fwds); // Careful with O(n^2) algo...
            return diffs;
        },

        doDiff_fast : function(oldS, newS) {
            /* The diff-match-patch library is much faster than the above
               levenshtein distance algorithm.

               To put a hard limit on the time this function takes, set the
               diff_match_patch.Diff_Timeout property to the number of seconds
               before a timeout occurs. The results returned are guaranteed to
               be a valid difference, though possibly suboptimal.
             
               The diff generated by this library is based on inserts and
               deletes only (no updates). Thus, the diff array returned by this
               function will be greater than or equal to (in size) that returned
               by doDiff_ld.
             
               Tests show that the increase in number of commands sent to the
               server is increased by 2-4% at a maximum compared to using
               doDiff_ld. This data increase is worth it for the large speed
               increase over doDiff_ld. */

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
        },

        iterateSend : function() {
            var syncs;
            var ldOffset;
            this.newSnapshot = this.snapshot();
            if(null !== this.oldSnapshot && null !== this.newSnapshot) {
                if(this.oldSnapshot != this.newSnapshot) {
                    this.normalizeHTML();
                    this.newSnapshot = this.snapshot();
                    if (this.oldSnapshot != this.newSnapshot) {
                        syncs = this.syncs.concat(this.doDiff(this.oldSnapshot, this.newSnapshot));
                    }
                }
                if(syncs){
                    var s = '';
                    DEBUG ? console.log("WAS=%s", this.oldSnapshot):null;
                    DEBUG ? console.log("NOW=%s", this.newSnapshot):null;
                    for(var i=0; i<syncs.length; i++){
                        if(syncs[i] != undefined){
                               this.collab.sendSync('editorUpdate', syncs[i].ch, syncs[i].ty, syncs[i].pos);
                            s = s+syncs[i].ty+' '+syncs[i].ch+' '+syncs[i].pos+'\n';
                        }
                    }
                    DEBUG ? console.log("diffs=%s",s):null;
                }
            }
        },

        iterateRecv : function() {
            //Get local typing syncs
            this.syncs = [];
            var currentSnap = this.snapshot();
            if (this.newSnapshot != currentSnap)
                this.syncs = this.doDiff(this.newSnapshot, currentSnap);

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
            /* The Rangy span will be one of search# or search#a (or neither). */
            var val = this.value;
            var search1 = '<span style="line-height: 0; display: none;" id="1sel';
            var search1a = '<span id="1sel';
            var search2 = '<span style="line-height: 0; display: none;" id="2sel';
            var search2a = '<span id="2sel';
            var start, end;
            /* I think WebKit inserts a weird character inside the span. */
            var markerLength = (dojo.isWebKit) ? 78 : 77;

            this.firstSpan = null;
            this.secondSpan = null;
            // Non-collapsed selection?
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
            DEBUG ? console.log("BEGIN UPDATE"):null;
            // Process the queue and check that the changes are valid.
            this.sel = rangy.saveSelection();
            this._skipRestore = false;
            this.value = this._textarea.innerHTML;
            /* We will actually remove Rangy's invisible markers, perform the remote operations,
               then add the markers back in. We track remote changes to update the position of the
               markers - this makes performing the operations easier (faster) and removes the bug
               of Rangy's markers invalidating the HTML.
                */
                    // TODO remove
            if (DEBUG) {
                var s = '';
                for(var i=0; i<this.q.length; i++){
                    if(this.q[i] != undefined){
                        s = s+this.q[i].type+' '+this.q[i].value+' '+this.q[i].position+'\n';
                    }
                }
                DEBUG ? console.log("this.q diffs=%s",s):null;
            }
            DEBUG ? console.log("this.q.length=%d", this.q.length):null;
            DEBUG ? console.log("this.value    spans=%s",this.value):null;
            this.removeRangySpans();
            DEBUG ? console.log("this.value no spans=%s",this.value):null;
            for(var i=0; i<this.q.length; i++){
                if(this.q[i].type == 'insert')
                    this.insertChar(this.q[i].value, this.q[i].position);
                if(this.q[i].type == 'delete')
                    this.deleteChar(this.q[i].position);
                if(this.q[i].type == 'update')
                    this.updateChar(this.q[i].value, this.q[i].position);
            }
            DEBUG ? console.log("changes=%s", this.value):null;
            if (!this.willHTMLChange(this.value)) {
                // If HTML is valid, update textarea and clear the queue.
                // Order important for below operations!
                this.valueNoRangy = this.value;
                if (!this._skipRestore) {
                    this.restoreRangySpan(this.secondSpan);
                    this.restoreRangySpan(this.firstSpan);
                }
                DEBUG ? console.log("spanses=%s",this.value):null;
                /* Recheck HTML - the rangy solution for remembering caret position is not perfect.
                   It sometimes fails when the caret is located inbetween remote edit operations.
                   In this case, we don't try to restore the caret and let the caret reset itself. */
                if (this.willHTMLChange(this.value))
                {
                    DEBUG?console.warn("CHANGED SECOND %s", this.value):null;
                    this.value = this.valueNoRangy;
                    this.clearSelection();
                }
                this._textarea.innerHTML = this.value;
                this.q = [];
            } // Else, do nothing and wait for more remote changes.
            else { DEBUG ? console.warn("HTML WOULD HAVE CHANGED"):null}
            if (!this._skipRestore && this.sel)
                rangy.restoreSelection(this.sel);
            DEBUG?console.log("END UPDATE"):null;
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
                    this.clearSelection();
                    this.firstSpan.skip = true;
                }
            }
            if (this.secondSpan && pos <= this.secondSpan.pos) {
                this.secondSpan.pos += dx;
                if (0 === this.secondSpan.pos || this.secondSpan.pos >= this.value.length) {
                    this.clearSelection();
                    this.secondSpan.skip = true;
                }
            }

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

