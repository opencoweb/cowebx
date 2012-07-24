
// TODO remove once Chris's changes are tested.
var DEBUG = false;
function curVal() { return dojo.query(".nicEdit-main")[0].innerHTML; }

// TODO refactor code

define([
	"dojo",
	"dijit/_Widget",
	"dijit/_TemplatedMixin",
	"dijit/_Contained",
	"dojo/text!./TextEditor.html",
	"coweb/main",
	"coweb/ext/attendance",
	"./AttendeeList",
	"./ShareButton",
	"dijit/Dialog",
	"dijit/form/ToggleButton",
	"./lib/niceEdit/niceEdit-latest",
	"dojo/text!./TextEditor.css",
	"dojo/dom-construct",
	"dojo/_base/array",
	"dojo/_base/declare",
	"./TreeTools",
	"./EditorData",
	"dojox/mobile/parser",
	"dijit/layout/ContentPane",
	"dijit/layout/BorderContainer",
	"./lib/diff_match_patch"
], function(dojo, _Widget, _TemplatedMixin, _Contained, template, coweb,
		attendance, AttendeeList, ShareButton, Dialog, ToggleButton, nicEditors,
		css, domConstruct, array, declare, EditorTree, EditorData) {

	function preprocessTree(t) {
		/* Make sure the root is the exact node: `<div></div>`
		   The assumption is that the only case where the roots don't initially
		   match for the editor is when the innerHTML is something like
		   `<div>..text...text..</div>`. */
		var tmp;
		if (null !== t.text) {
			tmp = new EditorTree(t);
			tmp.text = t.text;
			t.text = null;
			t.children = [tmp];
		}
	}

	return declare("DomRichTextEditor",
			[_Widget, _TemplatedMixin, _Contained],
{
	// widget template
	templateString: template,

	startup: function() {
		this._loadTemplate(require.toUrl(
				'cowebx/dojo/RichTextEditor/TextEditor.css'));
		this.buildEditor();
		dojo.fadeIn({node:this.editorNode,duration:1000}).play();
	},

	buildEditor: function() {
		//1. Process args
		window.foo          = this;
		if (!this.collabID || this.collabID==undefined)
			console.error("RichTextEditor: unique collabID required.");
		this.id             = this.collabID;
		this.go             = true;

		//2. Build stuff
		dojo.create('textarea', {style:'width:100%;height:100%;' },
				this.divContainerBody);
		nicEditors.nicEditors.allTextAreas();
		this._textarea 		= dojo.query('.nicEdit-main')[0];
		this._toolbar 		= dojo.query('.nicEdit-panel')[0];
		this._buildToolbar();
		this._footer		= this._buildFooter();
		this._attendeeList 	= new AttendeeList({domNode:this.innerList,
				id:'_attendeeList'});
		this._shareButton 	= new ShareButton({
			'domNode':this.infoDiv,
			'listenTo':this._textarea,
			'id':'shareButton',
			'displayButton':false
		});
		this.divChecker = domConstruct.create("div");
		this.oldDiv = domConstruct.create("div");
		this.newDiv = domConstruct.create("div");
		this.differ = new diff_match_patch();

		//3. parameters
		this._editorData = new EditorData(this._textarea);
		this.syncs          = [];
		this.oldSnapshot    = this.snapshot();
		this.newSnapshot    = null;
		this.timeoutId      = null;
		this.interval       = 100;
		this.title          = "Untitled Document";
		this._skipRestore   = false;
		this._ready = false;

		//4. Style / connect
		this._style();
		this.connect();

		//5. kick things off
		if (this.go == true)
		   this.listenInit();
	},

	aquireUrlParams: function(param) {
		param = param.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
		var pattern = "[\\?&]"+param+"=([^&#]*)";
		var regex = new RegExp( pattern );
		var results = regex.exec( window.location.href );
		if(results == null)
			return null;
		else
			return results[1];
	},

	onCollabReady : function(){
		this._ready = true;
		this.collab.pauseSync();
		this.resize();
	},

	listenInit : function(){
		this.collab.pauseSync();
		this.timeoutId = setTimeout(dojo.hitch(this, "iterate"), this.interval);
	},

	domTree : function() {
		return this._editorData.domTree;
	},

	syncQueue : function() {
		return this._editorData.syncQueue;
	},

	domMap : function() {
		return this._editorData.domTree_map;
	},

	onRemoteAddNode : function(data) {
		var value = data.value;
		var newNode = EditorTree.applyIns(
				value.x,
				this.domMap()[value.parentId],
				data.position,
				value.newId);
		this.domMap()[value.newId] = newNode;
	},
	onRemoteDeleteNode : function(data) {
		// The sync event tells us to delete a node from its parent.
		var toDelete =
			this.domMap()[data.value.oldParent].children[data.position];
		EditorTree.applyDel(toDelete, data.position);
		delete this.domMap()[toDelete.id];
	},
	onRemoteMoveNode : function(data) {
		/* Unfortunately, we can't use applyMov because the coweb API must
		   use an insert/delete pair. */
		var node;
		var p;
		if ("insert" == data.type) {
			node = this.domMap()[data.value.id];
			p = this.domMap()[data.value.newParent];
			node.parent = p;
			node.depth = p.depth + 1;
			if (p.children)
				p.children.splice(data.position, 0, node);
			else
				p.children = [node];
		} else if ("delete" == data.type) {
			p = this.domMap()[data.value.oldParent];
			// Remove node from parent's children array.
			p.children.splice(data.position, 1);
			if (0 == p.children.length)
				p.children = null;
		}
	},
	onRemoteUpdateNode : function(data) {
		var node = this.domMap()[data.value.pid].children[data.position];
		EditorTree.applyUpd(node, data.value.val);
	},

	onTreeUpdate : function(obj) {
		this.syncQueue().push(obj);
	},

	applySyncs : function() {
		array.forEach(this.syncQueue(), function(obj) {
			if(obj.type == "insert" && obj.value["force"]) {
				this.onRemoteAddNode(obj);
			} else if(obj.type == "delete" && obj.value["force"]) {
				this.onRemoteDeleteNode(obj);
			} else if(obj.type == "insert") {
				this.onRemoteMoveNode(obj);
			} else if(obj.type == "delete") {
				this.onRemoteMoveNode(obj);
			} else if(obj.type == "update") {
				this.onRemoteUpdateNode(obj);
			}
		}, this);
		this._editorData.generateCursorHTML();
		console.log("applySyncs first:"+this.domTree().toHTML());
		this._textarea.innerHTML = this._editorData.generateLocalHTML();
		console.log("applysyncs seond:"+this._editorData.getLocalHTML());
		this._editorData.setSyncQueue([]);
	},

	doTreeDiff : function(oldTree, newHTML) {
		var newTree, diffs;
		this.newDiv.innerHTML = newHTML;
		newTree = EditorTree.createTreeFromElement(this.newDiv);
		preprocessTree(oldTree);
		preprocessTree(newTree);

		// Get diffs, then send syncs.
		var s=oldTree.toHTML()+"\n"+newTree.toHTML();
		diffs = EditorTree.treeDiff(oldTree, newTree, this.domMap());
		if (oldTree.toHTML() != newTree.toHTML()) {
			console.error("diff broke");
			console.log(s);
			console.log(oldTree.toHTML());
			console.log(newTree.toHTML());
		}
		/* In rare certain cases, EditorTree.createTreeFromElement and
		   toHTML return a different string than newHTML. The visual output
		   *should* be the same, but just to be sure, match
		   this._textarea.innerHTML to whatever is returned by toHTML.
		   Documented cases appear below.

		   1. "&nbsp" is converted to a single space character by toHTML.

		   TODO It would be better if we could avoid this step somehow
		   (eg. make createTreeFromElement always be the same as the input).
		 */
		var html = this._editorData.getLocalHTML();
		if (html != newHTML) {
			// TODO this._textarea.innerHTML = html;
		}
		this._editorData.generateCursorHTML();
		return diffs;
	},

	iterate : function() {
		if (!this._ready) {
			this.timeoutId = setTimeout(
					dojo.hitch(this, "iterate"), this.interval);
			return;
		}
		if (null === this.domTree()) {
			this._editorData.setUniqueId(0); /* First user gets id 0. */
			/* Add local cursor position to construct Dom tree which contains
			   everyone's cursor information (from current-html => cursor-html
			   => tree). */
			var value = this._editorData.addLocalCursorSpan();
			if (false === value)
				throw Error("Cursor data not available."); // TODO what to do...

			this.newDiv.innerHTML = "";
			this.newDiv.innerHTML = value; // cursor-html
			this._editorData.setDomTree( // cursor-tree
					EditorTree.createTreeFromElement(this.newDiv));
			this._editorData.generateDomTreeMap();
		}
		this.iterateSend();
		this.iterateRecv();
	},

	/* This function transforms the editor HTML into HTML that all major
	   browsers support. This is important because iterateRecv will set
	   _textarea.innerHTML, and doing so with invalid HTML will lead to a
	   divergence between two client's editor HTML content (i.e. the data
	   becomes out of sync).

	   This function exists in hopes that one day a perfect implementation
	   will exist. Right now, the implementation assumes that if setting
	   innerHTML works without modification on this client, it will work on
	   all clients. However, this is likely not 100 percent correct. */
	normalizeHTML : function() {
		//var sel = rangy.saveSelection();
		this.divChecker.innerHTML = "";
		this.divChecker.innerHTML = this._textarea.innerHTML;
		this._textarea.innerHTML = this.divChecker.innerHTML;
		//if (sel)
		//	rangy.restoreSelection(sel);
	},

	eachDiff : function(dd) {
		var args = dd.args;
		var obj;
		/* TODO refactor this...make the edit script give us
		   exactly what we want to send. */
		switch (dd.ty) {
			case "insert":
				// {x=new node data, y=parent, k=position, newId=new id}
				obj = {};
				obj.parentId = args.y;
				obj.x = args.data;
				obj.newId = args.newId;
				obj.force = true;
				DEBUG?console.log("sync(insert)",obj):null;
				this.collab.sendSync("change." + args.y, obj, "insert", args.k);
				break;
			case "delete":
				// {x=node to delete, k=position of x in x.parent.children}
				obj = {force:true, oldParent:args.parentId};
				DEBUG?console.log("sync(delete)",obj):null;
				this.collab.sendSync("change." + args.parentId, obj, "delete",
						args.k);
				break;
			case "update": // {x=node to update, val=node to copy from}
				obj = {val:args.val, k:args.k, pid:args.pid};
				DEBUG?console.log("sync(update)",obj):null;
				/* TODO do we ever update the root? we shouldnt allow it
				   (or find a workaround)! */
				this.collab.sendSync("change." + args.pid, obj, "update",
						args.k);
				break;
			case "move":
				// {x=node to move, y=new parent, k=new pos, oldK=old pos}
				obj = {oldParent:args.oldParent, id:args.x, newParent:args.y};
				DEBUG?console.log("sync(del-move)",obj):null;
				this.collab.sendSync("change." + args.oldParent, obj, "delete",
						args.oldK);
				DEBUG?console.log("sync(ins-move)",obj):null;
				this.collab.sendSync("change." + args.y, obj, "insert", args.k);
				break;
		}
	},

	iterateSend : function() {
		/* First, check if the cursor has moved, and if it has, update the
		   custom cursor spans. */
		var value = this._editorData.addLocalCursorSpan();
		if (false === value)
			throw Error("Cursor data not available."); // TODO what to do...

		var syncs = null;
		this.newSnapshot = value;
		if (null !== this.oldSnapshot && null !== this.newSnapshot) {
			if (this.oldSnapshot != this.newSnapshot) {
				// TODO this.normalizeHTML();
				value = this._editorData.addLocalCursorSpan();
				if (false === value)
					throw Error("Cursor data not available."); // TODO
				this.newSnapshot = value;
				if (this.oldSnapshot != this.newSnapshot) {
					syncs = this.syncs.concat(this.doTreeDiff(this.domTree(),
								this.newSnapshot));
				}
			}
			if (syncs) {
				array.forEach(syncs, this.eachDiff, this);
			}
		}
	},

	iterateRecv : function() {
		// Get local typing syncs.
		this.syncs = [];
		var currentSnap = this.snapshot();
		if (this.newSnapshot != currentSnap) {
			this.syncs = this.doTreeDiff(this.domTree(), currentSnap);
		}

		this.collab.resumeSync();
		this.collab.pauseSync();
		if (this.syncQueue().length > 0)
			this.applySyncs();
		this.oldSnapshot = this.snapshot();
		this.timeoutId = setTimeout(dojo.hitch(this, "iterate"), this.interval);
		this._editorData.placeLocalCursor();
	},

	onUserChange : function(params) {
		//Break if empty object
		if (!params.users[0])
			return;
		if (params.type == "join") {
			//Locally create a new listItem for the user
			this._attendeeList.onLocalUserJoin(params.users);
		} else if (params.type == "leave") {
			//Locally delete listItem for the user
			this._attendeeList.onUserLeave(params.users);
		}
	},

	willHTMLChange : function(html) {
		this.divChecker.innerHTML = "";
		this.divChecker.innerHTML = html;
		if (this.divChecker.innerHTML != html)
			return true; // True if DOM changed the html (i.e. was malformed).
		else
			return false;
	},

	snapshot : function(){
		return this._editorData.addLocalCursorSpan();
	},

	connect : function(){
		this.collab = coweb.initCollab({id : this.id});
		this.collab.subscribeReady(this,'onCollabReady');
		this.collab.subscribeSync('change.*', this, 'onTreeUpdate');
		this.collab.subscribeSync('editorTitle', this, '_onRemoteTitle');
		this.collab.subscribeStateRequest(this, 'onStateRequest');
		this.collab.subscribeStateResponse(this, 'onStateResponse');
		dojo.connect(this._textarea, 'onfocus', this, '_onFocus');
		dojo.connect(this._textarea, 'onblur', this, '_onBlur');
		dojo.connect(this.url,'onclick',this,function(e) {
				this.selectElementContents(e.target)
		});
		dojo.connect(this.url,'onblur',this,function(e) {
				e.target.innerHTML = window.location;
		});
		dojo.connect(window, 'resize', this, 'resize');
		// dojo.connect(dojo.byId('saveButton'),'onclick',this,function(e){
		//     dojo.publish("shareClick", [{}]);
		// });
		attendance.subscribeChange(this, 'onUserChange');
	},

	onStateRequest : function(token){
		/* Need to make domTree non-circular in order to send it. Just remove
		   all parent references and other clients can re construct that
		   information later. */
		var map = this.domMap();
		this.domTree().levelOrder(function(at) {
			if (at.parent)
				at.parent = at.parent.id;
		});
		var state = {
			domTree : this.domTree(),
			attendees: this._attendeeList.attendees,
			title: this.title
		};
		this.collab.sendStateResponse(state,token);
		this.domTree().levelOrder(function(at) {
			at.parent = map[at.parent];
		});
	},

	reconstructTree : function(rawObj) {
		var at, rawAt, q, tree, tmp, map;
		map = {};
		tree = new EditorTree(null);
		q = [{at:tree, rawAt:rawObj}];
		while (q.length > 0) {
			at = q[0].at;
			rawAt = q.shift().rawAt;
			at.id = rawAt.id;
			at.copyFrom(rawAt);
			map[at.id] = at;
			if (rawAt.children)
				at.children = [];
			array.forEach(rawAt.children, function(child) {
				var ntree = new EditorTree(at);
				at.children.push(ntree);
				q.push({at:ntree, rawAt:child});
			});
		}
		this._editorData.setDomTreeMap(map);
		return tree;
	},

	onStateResponse : function(obj) {
						  console.log("in onstate response");
		this._textarea.innerHTML = '';
		this._editorData.setDomTree(this.reconstructTree(obj.domTree));
		this._textarea.innerHTML = this._editorData.toHTML();
		// TODO check incompatible client by doing a divChecker validation.
		this.oldSnapshot = this.newSnapshot = this.snapshot();
		this.title = obj.title;
		this._title.value = this.title;
		var userCount = 0;
		for(var i in obj.attendees){
			++userCount;
			var o = {
				value: {
					'site':i,
					'name':obj.attendees[i]['name'],
					'color':obj.attendees[i]['color']
				}
			};
			this._attendeeList.onRemoteUserJoin(o);
		}
		this._editorData.setUniqueId(userCount);
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

	selectElementContents: function(el) {
		var range = document.createRange();
		range.selectNodeContents(el);
		var sel = window.getSelection();
		sel.removeAllRanges();
		sel.addRange(range);
	},

	resize: function(){
		dojo.style(this.editorNode,'height',document.body.offsetHeight+'px');
		dojo.style(this.editorTable,'height',
				this.editorTable.parentNode.offsetHeight+'px');
		dojo.style(this.innerList,'height',
				(this.editorTable.parentNode.offsetHeight -
				 this.infoDiv.offsetHeight)
				+'px');
		dojo.style(this.divContainer,'height',
				this.editorTable.parentNode.offsetHeight+'px');
		dojo.style(this.divContainerBody,'height',
				(this.editorTable.parentNode.offsetHeight-61)+'px');
	},

	_loadTemplate : function(url) {
		var e = document.createElement("link");
		e.href = url;
		e.type = "text/css";
		e.rel = "stylesheet";
		e.media = "screen";
		document.getElementsByTagName("head")[0].appendChild(e);
	},

	_style: function() {
		dojo.addClass(this._textarea.parentNode, 'textareaContainer');
		dojo.addClass(this._textarea, 'textarea');

		dojo.style(this._toolbar.parentNode.parentNode,'width','100%');
		dojo.style(this._toolbar.parentNode.parentNode,'height','37px');
		dojo.style(this._toolbar.parentNode.parentNode,'border','0px');

		dojo.style(this._toolbar.parentNode,'height','37px');
		dojo.style(this._toolbar.parentNode,'border','0px');
		dojo.style(this._toolbar.parentNode,'borderBottom','1px solid #BBBBBB');

		dojo.style(this._toolbar,'height','37px');
		dojo.style(this._toolbar, 'width','100%');
		dojo.style(this._toolbar, 'margin','0px');
		dojo.style(this._toolbar, 'borderRight', '0px')
		dojo.style(this._toolbar, 'padding-left','10px');

		var rulerContainer = dojo.create('div',{'class':'rulerContainer',
				id:'rulerContainer'},
				this._toolbar.parentNode,'after');
		var i = dojo.create('img',
				{src:require.toUrl(
					'cowebx/dojo/RichTextEditor/images/ruler.png'),
				'class':'ruler'},
				rulerContainer, 'first');

		dojo.attr(this.url,'innerHTML',window.location);
	},

	_buildFooter: function() {
		var footerNode = dojo.create('div',{'class':'footer gradient'},
				this.divContainer,'last');

		//1. Title box & image
		var title = dojo.create('input',{'class':'title',
				value:'Untitled Document',type:'text'},footerNode,'first');
		var edit = dojo.create('img',
				{src:require.toUrl(
					'cowebx/dojo/RichTextEditor/images/pencil.png'),
				'class':'editIcon'},title,'after');

		//2. Connect
		dojo.connect(title, 'onclick', this, function(e) {
			dojo.style(e.target, 'background', 'white');
		});
		dojo.connect(title, 'onblur', this, function(e){
			this.title = (e.target.value.length > 0) ? e.target.value :
			this.title;
			e.target.value = this.title;
			dojo.style(e.target, 'background', '');
			this.collab.sendSync('editorTitle', {'title':e.target.value}, null);
		});
		dojo.connect(title, 'onkeypress', this, function(e) {
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
			switch(i) {
				case 1:
					dojo.style(this._toolbar.childNodes[i].firstChild.firstChild.firstChild,
						'background', 'url('+require.toUrl('cowebx/dojo/RichTextEditor/images/bold.png')+')');
					break;
				case 2:
					dojo.style(this._toolbar.childNodes[i].firstChild.firstChild.firstChild,
						'background', 'url('+require.toUrl('cowebx/dojo/RichTextEditor/images/italic.png')+')');
					break;
				case 3:
					dojo.style(this._toolbar.childNodes[i].firstChild.firstChild.firstChild,
						'background', 'url('+require.toUrl('cowebx/dojo/RichTextEditor/images/underline.png')+')');
					break;
				case 8:
					dojo.style(this._toolbar.childNodes[i].firstChild.firstChild.firstChild,
						'background', 'url('+require.toUrl('cowebx/dojo/RichTextEditor/images/ordered.png')+')');
					break;
				case 9:
					dojo.style(this._toolbar.childNodes[i].firstChild.firstChild.firstChild,
						'background', 'url('+require.toUrl('cowebx/dojo/RichTextEditor/images/unOrdered.png')+')');
					break;
				case 10:
					dojo.attr(this._toolbar.childNodes[i].firstChild.firstChild,'style',
						dojo.attr(this._toolbar.childNodes[i].firstChild.firstChild,'style')+'padding: 0px !Important;');
					dojo.attr(this._toolbar.childNodes[i],'style',
						dojo.attr(this._toolbar.childNodes[i],'style')+'width: 91px !Important;');
					dojo.style(this._toolbar.childNodes[i].firstChild.firstChild.firstChild,
						'background', 'url('+require.toUrl('cowebx/dojo/RichTextEditor/images/fontSize.png')+')');
					break;
				case 11:
					dojo.attr(this._toolbar.childNodes[i].firstChild.firstChild,'style',
						dojo.attr(this._toolbar.childNodes[i].firstChild.firstChild,'style')+'padding: 0px !Important;');
					dojo.attr(this._toolbar.childNodes[i],'style',
						dojo.attr(this._toolbar.childNodes[i],'style')+'width: 91px !Important;');
					dojo.style(this._toolbar.childNodes[i].firstChild.firstChild.firstChild,
						'background', 'url('+require.toUrl('cowebx/dojo/RichTextEditor/images/fontFace.png')+')');
					break;
				case 15:
					dojo.style(this._toolbar.childNodes[i].firstChild.firstChild.firstChild,
						'background', 'url('+require.toUrl('cowebx/dojo/RichTextEditor/images/image.png')+')');
					break;
				case 19:
					dojo.style(this._toolbar.childNodes[i].firstChild.firstChild.firstChild,
						'background', 'url('+require.toUrl('cowebx/dojo/RichTextEditor/images/textColor.png')+')');
					break;
				case 20:
					dojo.style(this._toolbar.childNodes[i].firstChild.firstChild.firstChild,
						'background', 'url('+require.toUrl('cowebx/dojo/RichTextEditor/images/hiliteColor.png')+')');
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
		var redo = dojo.create('div',
			{'class':'toolbarButtonCustom',style:'background-image:url('+
				require.toUrl('cowebx/dojo/RichTextEditor/images/redo.png')+');'},this._toolbar,'first');
		var undo = dojo.create('div',{'class':'toolbarButtonCustom',style:'background-image:url('+
				require.toUrl('cowebx/dojo/RichTextEditor/images/undo.png')+');'},this._toolbar,'first');
		dojo.connect(redo, 'onclick', this, function(){ document.execCommand('redo',"",""); });
		dojo.connect(undo, 'onclick', this, function(){ document.execCommand('undo',"",""); });
		dojo.create('div',{'class':'toolbarDiv'},this._toolbar,'first');
		var save = dojo.create('div',{'class':'toolbarButtonCustom',style:'background-image:url('+
					require.toUrl('cowebx/dojo/RichTextEditor/images/save.png')+');'},this._toolbar,'first');
		dojo.connect(save, 'onclick', this, 'onSaveClick');
		this._buildConfirmDialog();
	},

	onSaveClick: function() {
		dojo.publish("shareClick", [{}]);
	},

	_buildConfirmDialog: function() {
		secondDlg = new Dialog({
			title: "Are you sure?",
			style: "width: 300px;font:12px arial;",
			id: 'tDialog'
		});
		var h = dojo.create('div',
				{'style':'margin-left:auto;margin-right:auto;width:80px;margin-bottom:5px'},
				secondDlg.domNode,'last');
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
		return secondDlg;
	},

	_onRemoteTitle: function(obj) {
		this.title = obj.value.title;
		this._title.value = this.title;
	},

	cleanup : function() {
		if (this.timeoutId != null) {
			clearTimeout(this.timeoutId);
			this.timeoutId = null;
		}
	}

}); // end declare("DomRichTextEditor")

}); // end define()

