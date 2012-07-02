//
// Cooperative tree app
//
// Copyright (c) The Dojo Foundation 2011. All Rights Reserved.
//
//

/*
   TODO remove code that sends targetID as part of the sync
   TODO update tutorial page and make moderator/non-moderator app tutorials different

   FIXME onStateRequest gives bad data sometimes, so no new clients can join.
   FIXME moving nodes around really quickly leads to out of sync, even though sync events are correct.
		 probably an implementation bug of onRemoteMove not faithfully honoring remote events.

*/

define([
	'dojo',
	'coweb/main',
	'dijit/dijit',
	'dojo/data/ItemFileWriteStore',
	'dijit/Tree',
	'dijit/tree/TreeStoreModel',
	'dijit/tree/dndSource',
	'dijit/Menu',
	'dijit/form/Button',
	'dijit/Dialog',
	'dijit/form/TextBox',
	'dojo/parser',
	'dojo/_base/array',
	'dojo/dnd/common',
	'dojo/dnd/Source'],
function(dojo, coweb, dijit, Store, Tree, Model, dndSource, Menu, Button, Dialog, TextBox, parser, array) {
	parser.parse();
	/*var bs  = document.getElementById("ps");
	bs.onclick = function() {
		if (bs.value=="pause"){
			bs.value="resume";
			app.collab.pauseSync();
		} else {
			bs.value="pause";
			app.collab.resumeSync();
		}
	};*/
	var app = {
		init: function(){
			// Properties
			this.dndOps = {};           // Track each node's drag and drop movement.
			this.superRootId = -1;      // This is the imaginary root of the entire tree.
			window.foo = this;          // For debugging
			this._getData();            // Fetch the initial data.json
			this._buildButtons();       // Build UI buttons

			// Build dojo Tree components
			this.store 		= (this.store) ? this.store : new Store({data:this.data});
			this.model 		= new Model({store:this.store, query:{id:"root"}});
			this.tree 		= this._buildTree();

			// Connect collab & local events
			this.collab = coweb.initCollab({id:'phonebook'});
			this.collab.subscribeSync('change.*', this, 'onRemoteChange');
			this.collab.subscribeStateRequest(this, 'onStateRequest');
			this.collab.subscribeStateResponse(this, 'onStateResponse');
			this._connectEvents();

			// Kick off session
			var sess = coweb.initSession();
		    sess.prepare();
		},

		onLocalAddNode: function(obj){
			// Set flag to indicate a regular 'insert'
			obj['force'] = true;
			// Send sync with topic corresponding to parent id
			console.log("Local insert: %d[%d] = %d", obj.parentId, obj.pos, obj.id);
			this.collab.sendSync('change.'+obj.parentId, obj, 'insert', obj.pos);
		},

		onRemoteAddNode: function(obj){
			// Get parent item from synced parentId
			console.log("Remote insert: %d[%d] = %d", obj.value.parentId, obj.position, obj.value.id);
			var parentItem = this._getItemById(obj.value.parentId);
			// If parent item found...
			if(parentItem){
				// add the new item to data store
				var newItem = this.store.newItem({ id: obj.value.id, name:obj.value.value});
				var parentId = obj.value.parentId;
				// update parent node's children in store & save
				var children = parentItem.children;
				if(children == undefined)
					children = [newItem];
				else {
					/* What a joke...for whatever reason the application breaks if I don't copy
					   the array. Spent over two hours trying to figure out why... */
					children = children.slice(0);
					children.splice(obj.position, 0, newItem);
				}
				this.store.setValue(parentItem,'children',children);
				this.store.save();
			} else {
				/* We can't honor the insert operation since the parent was already deleted. By assumption,
				   other clients will also delete this parent at some point, thereby negating their
				   insert of the desired node. Thus, we ignore this insert request. */
			}
		},

		onLocalDeleteNode: function(parentId, pos, force, id){
			var obj = {};
			obj['force'] = force;
			obj['parentId'] = parentId;
			obj['id'] = id; // TODO remove
			// Send sync with topic corresponding to parent id
			console.log("Local delete %d[%d]", parentId, pos);
			this.collab.sendSync('change.' + parentId, obj, 'delete', pos);
		},

		onRemoteDeleteNode: function(obj){
			console.log("Remote delete %d[%d] = %d", obj.value.parentId, obj.position, obj.value.id);
			var prevSelectedItemId = null;
			// Remove node focus temporarily & save ref
			if(this.tree.selectedItem) {
				prevSelectedItemId = this.tree.selectedItem.id[0];
				// Hide UI buttons temporarily
				this.tree.attr('selectedItem','_null');
				dojo.place('buttonContainer',document.body,'last');
				dojo.style('buttonContainer','display','none');
			}
			// Get targeted item by synced id
			var p = this._getItemById(obj.value.parentId);
			if (!p) {
				return;
			}
			var targetItem = p.children[obj.position];
			// Delete targeted item from store & save
			this.store.deleteItem(targetItem);
			this.store.save();
			// Re-focus prevSelectedItem if it exists
			if (prevSelectedItemId)
				this.tree.attr('selectedItem',prevSelectedItemId);
			// Try to show buttons again
			this._click();
		},

		onLocalMoveNode: function(obj){
			// send sync with topic corresponding to parent id
			// with no flag set, indicating a modified 'delete'
			// which keeps the node around
			console.log("Local move %d[%d] = %d   -> %d[%d]", obj.prevParentID, obj.prevPos, obj.targetID,
					obj.newParentID, obj.newPos);
			this.collab.sendSync('change.'+obj.prevParentID, obj, 'delete', obj.prevPos);
			// send sync with topic corresponding to parent id
			// with no flag set, indicating a modified 'insert'
			// which simply modifies children rather than creating
			// a new node
			this.collab.sendSync('change.'+obj.newParentID, obj, 'insert', obj.newPos);
		},

		validate: function(arr) {
			try{
			var been = {};
			function t(x) { if (been[x]) throw 5;been[x] = true; }
			var q = [];
			array.forEach(arr, function(m) { q.push(m); });
			while (q.length > 0) {
				var at = q.shift();
				t(at.id[0]);
				array.forEach(at.children, function(ch) {
					q.push(ch);
				});
			}
			} catch (e) { return false;
			}
			return true;
		},

		onRemoteMoveNode: function(obj){
			console.log("Remot move %d[%d] = %d   -> %d[%d] %s", obj.value.prevParentID,
					obj.value.prevPos, obj.value.targetID, obj.value.newParentID, obj.value.newPos,obj.type);
			if(obj.type == 'delete'){
				// Get parent item's children
				var prevParent = this._getItemById(obj.value.prevParentID);
				if (!prevParent) {
					return;
				}
				var children = prevParent.children;
				// Remove target item from children
				children = children.slice(0);
				children.splice(obj.position, 1);
				if (obj.position != obj.value.prevPos)
					console.log("delete positions changed");
				// Update store & save
				this.store.setValue(prevParent,'children',children);
				this.store.save();
			}else if(obj.type == 'insert'){
				// Get parent item's children
				var newItem = this._getItemById(obj.value.targetID);
				var newParent = this._getItemById(obj.value.newParentID);
				if (!newItem || !newParent) {
					return;
				}
				var children = newParent.children;
				// Add target item to children in proper pos
				if(children == undefined)
					children = [];
				else {
					children = children.slice(0);
					children.splice(obj.position, 0, newItem);
				}
				if (obj.position != obj.value.newPos)
					console.log("insert positions changed");
				if (!this.validate(children)) {
					console.log("Children subforest not valid.");
				}
				// Update store & save
				this.store.setValue(newParent,'children',children);
				this.store.save();
			}
		},

		onLocalUpdateNode: function(obj){
			// Send sync with topic corresponding to target node id
			console.log("Local update %d[%d] = %d",obj.parentId, obj.pos, obj.id);
			this.collab.sendSync('change.'+obj.parentId, obj, 'update', obj.pos);
		},

		onRemoteUpdateNode: function(obj){
			console.log("Remote update %d[%d] = %d", obj.value.parentId, obj.position, obj.value.id);
			// Get targeted item by synced id
			var targetItem, p;
			if (obj.value.parentId == this.superRootId) {
				// This is ok because we don't allow the root to be deleted.
				targetItem = this._getItemById(obj.value.id);
			} else {
				p = this._getItemById(obj.value.parentId);
				if (!p) {
					/* We can't honor the update operation since the parent was already deleted. By assumption,
					   other clients will also delete this parent at some point, thereby negating their
					   update of the desired node. Thus, we ignore this update request. */
					return;
				}
				targetItem = p.children[obj.position];
				if (!this._getItemById(obj.value.id))
					console.error("whoops");
			}
			// Set new name, update store & save
			var name = obj.value.name;
			this.store.setValue(targetItem,'name',name);
			this.store.save();
		},

		onRemoteChange: function(obj){
			// Normal insert
			if(obj.type == 'insert' && obj.value['force'])
				this.onRemoteAddNode(obj);
			// Normal delete
			else if(obj.type == 'delete' && obj.value['force'])
				this.onRemoteDeleteNode(obj);
			// Modified insert
			else if(obj.type == 'insert')
				this.onRemoteMoveNode(obj);
			// Modified delete
			else if(obj.type == 'delete')
				this.onRemoteMoveNode(obj);
			// Normal update
			else if(obj.type == 'update')
				this.onRemoteUpdateNode(obj);
		},

		onStateRequest: function(token){
			var obj = this._itemToJS(this.store, this.store._arrayOfTopLevelItems[0]);
			this.collab.sendStateResponse(obj, token);
		},

		onStateResponse: function(state){
			var d = {
				identifier: 'id',
				label: 'name',
				items: [state]
			};
			this.store = new Store({data:d});
			this._refreshTree();
		},

		_itemToJS: function(store, item){
		    var js = {};
		    if(item && store){
		      	var attributes = store.getAttributes(item);
		      	if(attributes && attributes.length > 0){
		        	var i;
		        	for(i = 0; i < attributes.length; i++){
		          		var values = store.getValues(item, attributes[i]);
		          		if(values){
		            		if(values.length > 1 ){
		              			var j;
		              			js[attributes[i]] = [];
		              			for(j = 0; j < values.length; j++ ){
		                			var value = values[j];
		                			if(store.isItem(value)){
		                  				js[attributes[i]].push(this._itemToJS(store, value));
		                			}else{
		                  				js[attributes[i]].push(value);
		                			}
		              			}
		            		}else{
		              			if(store.isItem(values[0])){
									js[attributes[i]] = this._itemToJS(store, values[0]);
		              			}else{
		                			js[attributes[i]] = values[0];
		              			}
		            		}
		          		}
		        	}
		      	}
		    }
		    return js;
	  	},

		_addNode: function(e){
			// Get selected item and name from dialog prompt
			var selectedItem = this.tree.selectedItem;
			var data = dijit.byId('addDialog').get('value');
			var name = data.name;
			// Check that a name was actually entered
			if(name.length<1){
				alert('Node label cannot be left blank');
				return false;
			}
			// Create new item.
			// We don't actually have a true way to generate unique IDs (unique across all clients).
			var date = new Date();
			var newId = String(Math.random()).substr(2) + String(date.getTime());
			var newItem = this.store.newItem({ id: newId, name:name});
			var parentId = selectedItem.id[0];
			// Update parent item's children in store & save
			var children = selectedItem.children;
			if(children == undefined)
				children = [];
			children = [newItem].concat(children);
			this.store.setValue(selectedItem,'children',children);
			this.store.save();
			// Trigger local callback
			this.onLocalAddNode({
				id: newId.toString(),
				parentId: parentId,
				value: name,
				pos: 0
			});
			// Housekeeping
			dijit.byId('addName').set('value','');
		},

		_deleteNode: function(e){
			var toDel = [];
			function del(node) {
				var id = node.item.id[0];
				var p = node.getParent();
				var children = p.getChildren();
				var item = node.item;
				/* Position for all children of the original node we are deleteing will
				   always be 0 since we delete in post-order traversal. */
				toDel.push([item, p.item.id[0], 0, id]);
			}
			function postOrder(node) {
				var i;
				var children = node.getChildren();
				for (i = 0; i < children.length; ++i) {
					postOrder(children[i]);
				}
				del(node);
			}
			// Move UI buttons out and hide them
			dojo.place('buttonContainer',document.body,'last');
			dojo.style('buttonContainer','display','none');
			this.collab.pauseSync();
			var target = this.tree.selectedNode;
			var targetId = target.item.id[0];
			if (!target.getParent().item) {
				return; // Can't delete the root.
			}

			// Correct way to delete is to delete all children (post-order traversal) first.
			postOrder(target);
			// Find the actual position of the last tree item (since its sync position won't be 0).
			var pos, p = target.getParent().item;
			array.some(p.children, function(at, i) {
				if (at.id[0] == targetId) {
					pos = i;
					return true;
				}
				return false;
			});
			array.forEach(toDel, function(itm) {
				this.store.deleteItem(itm[0]);
				this.store.save();
				this.onLocalDeleteNode(itm[1], itm[2], true, itm[3]);
			}, this);
			if (document.getElementById("ps").value=="pause")
				this.collab.resumeSync();
			this.collab.resumeSync();
		},

		_editNode: function(){
			// Get currently selected item & name from dialog prompt
			var targetItem = this.tree.selectedItem;
			var data = dijit.byId('editDialog').get('value');
			var name = data.name;
			// Check that we actually entered a name
			if(name.length<1){
				alert('Node label cannot be left blank');
				return false;
			}
			var parentItem = this.tree.selectedNode.getParent().item;
			var parentId, pos;
			if (parentItem) {
				parentId = parentItem.id[0];
				for(var i=0; i<parentItem.children.length; i++){
					if(parentItem.children[i].id[0] == targetItem.id[0])
						pos = i;
				}
			} else {
				parentId = this.superRootId;
				pos = 0;
			}
			// Modify item in store and save
			this.store.setValue(targetItem,'name',name);
			this.store.save();
			// Trigger local callback
			this.onLocalUpdateNode({
				id: targetItem.id[0], // for debugging only, should NOT be used by remote clients!
				parentId : parentId,
				pos : pos,
				name: name
			});
		},

		_dndStart: function(source, nodes, copy) {
			// I wish the dnd API would just tell me what node was being dnd-ed.
			if (1 != nodes.length)
				return;
			var targetNode, targetID, obj, p;
			targetNode = this.tree.selectedNode;
			targetID = targetNode.item.id[0];
			if (!this.dndOps[targetID]) {
				p = targetNode.getParent().item;
				obj = this.dndOps[targetID] = {
					targetNode : targetNode,
					prevParentID : p.id[0],
					domNode : nodes[0],
					targetID : targetID
				};
				array.some(p.children, function(at, i) {
					if (at.id[0] == targetID) {
						obj.prevPos = i;
						return true;
					}
					return false;
				});
			}
		},

		_dndDrop: function(source, nodes, copy, target) {
			if (1 != nodes.length)
				return;
			// It would be easier if the dnd API told me where the node was dropped.
			setTimeout(dojo.hitch(this, function(node) {
				var i, op, dndIdx;
				// Following is O(n)....but n *should* always be super tiny.
				dndOp = false;
				for (i in this.dndOps) {
					if (node == this.dndOps[i].domNode) {
						dndIdx = i;
						op = this.dndOps[i];
						break;
					}
				}
				if (!op)
					return;
				var p = op.targetNode.getParent().item;
				var newChildren = p.children;
				var pos;
				array.some(p.children, function(at, i) {
					if (at.id[0] == op.targetID) {
						op.newPos = i;
						return true;
					}
					return false;
				});
				op.newParentID = p.id[0];
				delete op.targetNode;
				delete op.domNode;
				// Trigger local callback
				this.onLocalMoveNode(op);
				delete this.dndOps[dndIdx];
			}, nodes[0]), 500);
		},

		_getData: function(){
			// Fetch data.json
			dojo.xhrGet({
				url: 'data/data.json',
				handleAs: 'json',
				preventCache: true,
				sync:true,
				load: dojo.hitch(this,function(data){
					this.data = data;
				})
			});
		},

		_getItemById: function(id){
			// Iterate over children looking for id
			for(var i=0; i<this.store._arrayOfAllItems.length; i++){
				if(this.store._arrayOfAllItems[i] && this.store._arrayOfAllItems[i].id[0] == id)
					return this.store._arrayOfAllItems[i];
			}
			return false;
		},

		_refreshTree: function(){
			// destroy tree widget
			dijit.byId('thisTree').destroyRecursive();
			// kick off model refresh from store
			this.model = new Model({store:this.store, query:{id:"root"}});
			// build tree again
			this.tree = this._buildTree();
		},

		_buildTree: function(){
			var tree = new Tree({
				id:'thisTree',
				'class':'container',
				model:this.model,
				betweenThreshold:5,
				persist:false,
				dndController:dndSource,
				openOnDblClick: true,
				autoExpand: true,
				onClick: dojo.hitch(this, '_click')
			});
			tree.placeAt(dojo.byId('treeContainer'));
			return tree;
		},

		_buildButtons: function(){
			//Add
			dojo.connect(dojo.byId('add'), 'onclick', dijit.byId("addDialog"), 'show');
			//Remove
			dojo.connect(dojo.byId('delete'), 'onclick', this, '_deleteNode');
			//Edit
			dojo.connect(dojo.byId('edit'), 'onclick', dijit.byId("editDialog"), 'show');
		},

		_hideDialog: function(){
			dijit.byId('addName').set('value','');
			dijit.byId('editName').set('value','');
		},

		_resize: function(){
			dojo.style('appContainer','height',(document.body.offsetHeight-190)+'px');
			dojo.style('treeContainer','height',(document.body.offsetHeight-210)+'px');

			//Late hook for add / edit / delete
			if(dojo.isWebKit){
				dojo.style('add','top','16px');
				dojo.style('edit','top','16px');
				dojo.style('delete','top','16px');
			}else{
				dojo.style('add','top','-6px');
				dojo.style('edit','top','-1px');
				dojo.style('delete','top','-6px');
			}
		},

		_click: function(){
			var node = dojo.query('.dijitTreeRowSelected');
			if(node[0]){
				dojo.place('buttonContainer',node[0],'last');
				dojo.style('buttonContainer','display','inline-block');
			}
		},

		_connectEvents: function(){
			dojo.subscribe("/dnd/drop", dojo.hitch(this, '_dndDrop'));
			dojo.subscribe("/dnd/start", dojo.hitch(this, '_dndStart'));
			dojo.connect(window,'resize',this,'_resize');
			dojo.connect(dijit.byId('addDialog'),'isValid',this,'_addNode');
			dojo.connect(dijit.byId('addDialog'),'hide',this,'_hideDialog');
			dojo.connect(dijit.byId('editDialog'),'isValid',this,'_editNode');
			dojo.connect(dijit.byId('editDialog'),'hide',this,'_hideDialog');
			this._resize();
		}

	};

	dojo.ready(function() {
		app.init();
	});
});
