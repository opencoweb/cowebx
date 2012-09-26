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
	'./CoTree',
	'dojo/dnd/common',
	'dojo/dnd/Source'],
function(dojo, coweb, dijit, Store, Tree, Model, dndSource, Menu, Button, Dialog, TextBox, parser, array, CoTree) {
	parser.parse();
	/*var bs  = document.getElementById("ps");
	bs.onclick = function() {
		if (bs.value=="pause") {
			bs.value="resume";
			app.collab.pauseSync();
		} else {
			bs.value="pause";
			app.collab.resumeSync();
		}
	};*/
	var app = {
		_generateTree: function(data) {
			var __generateTree = function(data) {
				var clist = [];
				array.forEach(data.children, dojo.hitch(this, function(at) {
					__generateTree(at);
					clist.push(at.id);
				}));
				this.myTree.createNode(data.id, data.name, clist);
			}
			__generateTree = dojo.hitch(this, __generateTree);
			__generateTree(data);
			this.myTree.setRoot(data.id);
		},

		init: function() {
			// Properties
			this.dndOps = {};           // Track each node's drag and drop movement.
			this.superRootId = -1;      // This is the imaginary root of the entire tree.
			window.foo = this;          // For debugging
			this._getData();            // Fetch the initial data.json
			this._buildButtons();       // Build UI buttons

			// Build internal tree representation.
			this.myTree = new CoTree();
			this._generateTree(this.data.items[0]);

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
			this._dndQueue = {};

			// Kick off session
			var sess = coweb.initSession();
			sess.prepare();
		},

		onLocalAddNode: function(obj) {
			var sync = this.myTree.localInsert(obj.parentId, obj.pos, obj.id, obj.value);
			this.collab.sendSync("change." + sync.collab, sync.value, 'insert', sync.position);
		},

		onRemoteAddNode: function(obj) {
			var pid = obj.name.substring(7);
			var parentItem = this._getItemById(pid);
			// If parent item found...
			if (parentItem) {
				// Add the new item to data store.
				var wasNew = this.myTree.remoteInsert(pid, obj.position, obj.value.id, obj.value.name);
				if (wasNew) {
					var newItem = this.store.newItem({ id: obj.value.id, name: obj.value.name});
					var parentId = obj.value.parentId;
					// update parent node's children in store & save
					var children = parentItem.children;
					if (children == undefined)
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
					/* Node already exists. */
					var oldParent = this._getItemById(obj.value.prevParentID);
					//var target = oldParent.children[obj.position];
					var target = this._getItemById(obj.value.id);
					this.model.pasteItem(target, oldParent, parentItem, 0, obj.position);
					this.store.save();
				}
			} else {
				/* We can't honor the insert operation since the parent was already deleted. By assumption,
				   other clients will also delete this parent at some point, thereby negating their
				   insert of the desired node. Thus, we ignore this insert request. */
				if (obj.value.move) {
					/* If this was a MOVE but the parent doesn't exist anymore, this means the parent
					 * was deleted by some other operation, and the subtree to be moved would be deleted
					 * eventually anyway. Lets do that here. */
					var target = this._getItemById(obj.value.id);
					if (target) {
						this._delNode(target);
					} else  {
						console.warn("remoteAdd: tried to delete subtree of already deleted " + 
								"node, but could not find subtree to delete");
					}
				} else {
					console.warn("remoteAdd: parent not found pid=", pid, obj);
				}
			}
		},

		onLocalDeleteNode: function(parentId, pos, force, id) {
			var obj = {};
			obj['force'] = force;
			obj['parentId'] = parentId;
			obj['id'] = id; // TODO remove
			// Send sync with topic corresponding to parent id
			this.collab.sendSync('change.' + parentId, obj, 'delete', pos);
		},

		onRemoteDeleteNode: function(obj) {
			// Get targeted item by synced id
			var pid = obj.name.substring(7);
			var p = this._getItemById(pid);
			if (!p) {
				console.warn("remoteDelete: Parent node doesn't exist id=", pid, obj);
				return;
			}
			var targetItem = p.children[obj.position];
			this.myTree.remoteDelete(pid, obj.position, obj.value.move);
			if (!obj.value.move) {
				this._delNode(targetItem);
			}
		},

		_delNode: function(targetItem) {
			var prevSelectedItemId = null;
			// Remove node focus temporarily & save ref
			if (this.tree.selectedItem) {
				prevSelectedItemId = this.tree.selectedItem.id[0];
				// Hide UI buttons temporarily
				this.tree.set('selectedItem','_null');
				dojo.place('buttonContainer',document.body,'last');
				dojo.style('buttonContainer','display','none');
			}
			// Delete targeted item from store & save
			this.store.deleteItem(targetItem);
			this.store.save();
			// Re-focus prevSelectedItem if it exists
			if (prevSelectedItemId)
				this.tree.set('selectedItem',prevSelectedItemId);
			// Try to show buttons again
			this._click();
		},

		onLocalMoveNode: function(obj) {
			/* Send sync with topic corresponding to parent id
			   with no flag set, indicating a modified "delete"
			   which keeps the node around. */
			obj.id = obj.targetID;
			obj.move = true;
			this.myTree.localDelete(obj.prevParentID, obj, true);
			this.collab.sendSync("change."+obj.prevParentID, obj, "delete", obj.prevPos);
			/* Send sync with topic corresponding to parent id
			   with no flag set, indicating a modified "insert"
			   which simply modifies children rather than creating
			   a new node. */
			this.myTree.localInsert(obj.newParentID, obj.newPos, obj.targetID, null);
			this.collab.sendSync("change."+obj.newParentID, obj, "insert", obj.newPos);
		},

		onRemoteMoveNode: function(obj) {
			if (obj.type == 'delete') {
				var op = {
					prevParent: this._getItemById(obj.value.prevParentID),
					target: this._getItemById(obj.value.targetID)
				};
				this._dndQueue[obj.value.targetID] = op;
			} else if (obj.type == 'insert') {
				var op = this._dndQueue[obj.value.targetID];
				if (!op)
					return;
				delete this._dndQueue[obj.value.targetID];
				var newParent = this._getItemById(obj.value.newParentID);
				if (!newParent) {
					return;
				}
				if (obj.position != obj.value.newPos)
					console.warn("insert positions changed");
				this.model.pasteItem(op.target, op.prevParent, newParent, 0, obj.value.newPos);
				this.store.save();
			}
		},

		onLocalUpdateNode: function(obj) {
			// Send sync with topic corresponding to target node id.
			var sync = this.myTree.localUpdate(obj.id, obj.name);
			this.collab.sendSync("change." + sync.collab, sync.value, "update", sync.position);
		},

		onRemoteUpdateNode: function(obj) {
			// Get targeted item by synced id.
			var id = obj.name.substring(7);
			var targetItem = this._getItemById(id);
			if (targetItem) {
				this.myTree.remoteUpdate(id, obj.value);
				this.store.setValue(targetItem, "name", obj.value);
				this.store.save();
			} else {
				console.warn("remoteUpdate: Can't find node id=", id, obj);
			}
		},

		onRemoteChange: function(obj) {
			if (obj.type == 'insert')
				this.onRemoteAddNode(obj);
			else if (obj.type == 'delete')
				this.onRemoteDeleteNode(obj);
			else if (obj.type == 'update')
				this.onRemoteUpdateNode(obj);
		},

		onStateRequest: function(token) {
			var obj = this._itemToJS(this.store, this.store._arrayOfTopLevelItems[0]);
			this.collab.sendStateResponse(obj, token);
		},

		onStateResponse: function(state) {
			var d = {
				identifier: 'id',
				label: 'name',
				items: [state]
			};
			this.store = new Store({data:d});
			this._refreshTree();
		},

		_itemToJS: function(store, item) {
			var js = {};
			if (item && store) {
			  	var attributes = store.getAttributes(item);
			  	if (attributes && attributes.length > 0) {
					var i;
					for(i = 0; i < attributes.length; i++) {
				  		var values = store.getValues(item, attributes[i]);
				  		if (values) {
							if (values.length > 1 ) {
					  			var j;
					  			js[attributes[i]] = [];
					  			for(j = 0; j < values.length; j++ ) {
									var value = values[j];
									if (store.isItem(value)) {
						  				js[attributes[i]].push(this._itemToJS(store, value));
									}else{
						  				js[attributes[i]].push(value);
									}
					  			}
							}else{
					  			if (store.isItem(values[0])) {
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

		_addNode: function(e) {
			// Get selected item and name from dialog prompt
			var selectedItem = this.tree.selectedItem;
			var data = dijit.byId('addDialog').get('value');
			var name = data.name;
			// Check that a name was actually entered
			if (name.length<1) {
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
			if (children == undefined)
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

		_deleteNode: function(e) {
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
				console.warn("Can't delete root!");
				return; // Can't delete the root.
			}
			var p = target.getParent();
			var sync = this.myTree.localDelete(p.item.id, targetId);
			this.collab.sendSync("change." + sync.collab, {move:false}, "delete", sync.position);
			this.store.deleteItem(target.item);
			this.store.save();
			/*if (document.getElementById("ps").value=="pause")
				this.collab.resumeSync();*/
			this.collab.resumeSync();
			return;

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
			this.collab.resumeSync();
		},

		_editNode: function() {
			// Get currently selected item & name from dialog prompt
			var targetItem = this.tree.selectedItem;
			var data = dijit.byId('editDialog').get('value');
			var name = data.name;
			// Check that we actually entered a name
			if (name.length<1) {
				alert('Node label cannot be left blank');
				return false;
			}
			var parentItem = this.tree.selectedNode.getParent().item;
			var parentId, pos;
			if (parentItem) {
				parentId = parentItem.id[0];
				for(var i=0; i<parentItem.children.length; i++) {
					if (parentItem.children[i].id[0] == targetItem.id[0])
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

		_getData: function() {
			// Fetch data.json
			dojo.xhrGet({
				url: 'data/data.json',
				handleAs: 'json',
				preventCache: true,
				sync:true,
				load: dojo.hitch(this,function(data) {
					this.data = data;
				})
			});
		},

		_getItemById: function(id) {
			// Iterate over children looking for id
			for(var i=0; i<this.store._arrayOfAllItems.length; i++) {
				if (this.store._arrayOfAllItems[i] && this.store._arrayOfAllItems[i].id[0] == id)
					return this.store._arrayOfAllItems[i];
			}
			return false;
		},

		_refreshTree: function() {
			// destroy tree widget
			dijit.byId('thisTree').destroyRecursive();
			// kick off model refresh from store
			this.model = new Model({store:this.store, query:{id:"root"}});
			// build tree again
			this.tree = this._buildTree();
		},

		_buildTree: function() {
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

		_buildButtons: function() {
			//Add
			dojo.connect(dojo.byId('add'), 'onclick', dijit.byId("addDialog"), 'show');
			//Remove
			dojo.connect(dojo.byId('delete'), 'onclick', this, '_deleteNode');
			//Edit
			dojo.connect(dojo.byId('edit'), 'onclick', dijit.byId("editDialog"), 'show');
		},

		_hideDialog: function() {
			dijit.byId('addName').set('value','');
			dijit.byId('editName').set('value','');
		},

		_resize: function() {
			dojo.style('appContainer','height',(document.body.offsetHeight-190)+'px');
			dojo.style('treeContainer','height',(document.body.offsetHeight-210)+'px');

			//Late hook for add / edit / delete
			if (dojo.isWebKit) {
				dojo.style('add','top','16px');
				dojo.style('edit','top','16px');
				dojo.style('delete','top','16px');
			}else{
				dojo.style('add','top','-6px');
				dojo.style('edit','top','-1px');
				dojo.style('delete','top','-6px');
			}
		},

		_click: function() {
			var node = dojo.query('.dijitTreeRowSelected');
			if (node[0]) {
				dojo.place('buttonContainer',node[0],'last');
				dojo.style('buttonContainer','display','inline-block');
			}
		},

		_connectEvents: function() {
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
