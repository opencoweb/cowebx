//
// Cooperative tree app 
//
// Copyright (c) The Dojo Foundation 2011. All Rights Reserved.
// 
//

define([
	'dojo',
	'coweb/main',
	'dijit/dijit',
	'dojo/data/ItemFileWriteStore',
	'./dijit/Tree',
	'dijit/tree/TreeStoreModel',
	'dijit/tree/dndSource',
	'dijit/Menu',
	'dijit/form/Button',
	'dojo/dnd/common',
	'dojo/dnd/Source',
	'dijit/Dialog',
	'dijit/form/TextBox'],
function(dojo, coweb, dijit, Store, Tree, Model, dndSource, Menu, Button, Dialog, TextBox) {
	var app = {
		init: function(){
			// Properties
			this.dndOps 	= [];		// Dojo-specific DnD queue
			this.globalID	= 1000;		// Starting ID for new nodes
			window.foo 		= this;		// For debugging
			this._getData();			// Fetch the initial data.json
			this._buildButtons();		// Build UI buttons
			
			// Build dojo Tree components
			this.store 		= (this.store) ? this.store : new Store({data:this.data});
			this.model 		= new Model({store:this.store, query:{id:"root"}});
			this.tree 		= this._buildTree();
			
			// Connect collab & local events
			this.collab = coweb.initCollab({id:'foobar'});
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
			this.collab.sendSync('change.'+obj.parentID, obj, 'insert', obj.pos);
		},
		
		onRemoteAddNode: function(obj){
			console.log('remote add');
			// Get parent item from synced parentID
			var parentItem = this._getItemById(obj.value.parentID);
			// If parent item found...
			if(parentItem){
				// add the new item to data store
				var newItem = this.store.newItem({ id: obj.value.id, name:obj.value.value});
				var parentID = obj.value.parentID;
				// update parent node's children in store & save
				var children = parentItem.children;
				if(children == undefined)
					children = [];
				children = [newItem].concat(children);
				this.store.setValue(parentItem,'children',children);
				this.store.save();
				// housekeeping
				this.globalID++;
			}else{
				throw new Error("Cotree: couldn't find synced parent node");
			}
		},

		onLocalDeleteNode: function(obj){
			// Set flag to indicate regular 'delete'
			obj['force'] = true;
			// Send sync with topic corresponding to parent id
			this.collab.sendSync('change.'+obj.parentID, obj, 'delete', obj.pos);
		},
		
		onRemoteDeleteNode: function(obj){
			// Remove node focus temporarily & save ref
			if(this.tree.selectedItem)
				var prevSelectedItemId = this.tree.selectedItem.id[0];
			// Hide UI buttons temporarily 
			this.tree.attr('selectedItem','_null');
			dojo.place('buttonContainer',document.body,'last');
			dojo.style('buttonContainer','display','none');
			// Get targeted item by synced id
			var targetItem = this._getItemById(obj.value.id);
			// Delete targeted item from store & save
			this.store.deleteItem(targetItem);
			this.store.save();
			// Re-focus prevSelectedItem if it exists
			this.tree.attr('selectedItem',prevSelectedItemId);
			// Try to show buttons again
			this._click();
		},

		onLocalMoveNode: function(obj){
			// send sync with topic corresponding to parent id
			// with no flag set, indicating a modified 'delete'
			// which keeps the node around
			this.collab.sendSync('change.'+obj.prevParentID, obj, 'delete', obj.prevPos);
			// send sync with topic corresponding to parent id
			// with no flag set, indicating a modified 'insert'
			// which simply modifies children rather than creating
			// a new node
			this.collab.sendSync('change.'+obj.newParentID, obj, 'insert', obj.newPos);
		},
		
		onRemoteMoveNode: function(obj){
			if(obj.type == 'delete'){
				// Get parent item's children
				var prevParent = this._getItemById(obj.value.prevParentID);
				var children = prevParent.children;
				// Remove target item from children
				children.splice(obj.value.prevPos, 1);
				// Update store & save
				this.store.setValue(prevParent,'children',children);
				this.store.save();
			}else if(obj.type == 'insert'){
				// Get parent item's children
				var newItem = this._getItemById(obj.value.targetID);
				var newParent = this._getItemById(obj.value.newParentID);
				var children = newParent.children;
				// Add target item to children in proper pos
				if(children == undefined)
					children = [];
				children = children.slice(0,obj.value.newPos).concat([newItem].concat(children.slice(obj.value.newPos)));
				// Update store & save
				this.store.setValue(newParent,'children',children);
				this.store.save();
			}
		},
		
		onLocalUpdateNode: function(obj){
			// Send sync with topic corresponding to target node id
			this.collab.sendSync('change.'+obj.id, obj, 'update', 0);
		},
		
		onRemoteUpdateNode: function(obj){
			// Get targeted item by synced id
			var targetItem = this._getItemById(obj.value.id);
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
			var state = { d: obj};
			this.collab.sendStateResponse(state, token);
		},
		
		onStateResponse: function(state){
			var d = {
				identifier: 'id',
				label: 'name',
				items: [state.d]
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
			// Create new item
			var newItem = this.store.newItem({ id: this.globalID.toString(), name:name});
			var parentID = selectedItem.id[0];
			// Update parent item's children in store & save
			var children = selectedItem.children;
			if(children == undefined)
				children = [];
			children = [newItem].concat(children);
			this.store.setValue(selectedItem,'children',children);
			this.store.save();
			// Trigger local callback
			this.onLocalAddNode({
				id: this.globalID.toString(),
				parentID: parentID,
				value: name,
				pos: 0
			});
			// Housekeeping
			dijit.byId('addName').set('value','');
			this.globalID++;
		},
		
		_deleteNode: function(e){
			// Move UI buttons out and hide them
			dojo.place('buttonContainer',document.body,'last');
			dojo.style('buttonContainer','display','none');
			// Get currently selected item & parent item
			var targetItem = this.tree.selectedItem;
			var parentItem = this.tree.selectedNode.getParent().item;
			// Get proper position to sync
			var pos;
			for(var i=0; i<parentItem.children.length; i++){
				if(parentItem.children[i].id[0] == targetItem.id[0])
					pos = i;
			}
			// delete item from store & save
			this.store.deleteItem(targetItem);
			this.store.save();
			// trigger local callback
			this.onLocalDeleteNode({
				id: targetItem.id[0],
				parentID: parentItem.id[0],
				pos:pos
			});
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
			// Modify item in store and save
			this.store.setValue(targetItem,'name',name);
			this.store.save();
			// Trigger local callback
			this.onLocalUpdateNode({
				id: targetItem.id[0],
				name: name
			});
		},
		
		_dnd: function(){
			// Get last op object from DnD queue (dojo hackiness)
			var ops = this.dndOps[this.dndOps.length-1];
			// Get new children, new position, and new parent ID
			var newChildren = this.tree.selectedNode.getParent().item.children;
			var pos;
			for(var i=0; i<newChildren.length; i++){
				if(newChildren[i].id[0] == ops['targetID'])
					pos = i;
			}
			ops['newPos'] = pos;
			ops['newParentID'] = this.tree.selectedNode.getParent().item.id[0];
			// Trigger local callback
			this.onLocalMoveNode(ops);
			// Clear DnD queue
			this.dndOps = [];
		},
		
		_getData: function(){
			// Fetch data.json
			dojo.xhrGet({
				url: 'data.json',
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
					selectedItem = this.store._arrayOfAllItems[i];
			}
			return selectedItem;
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
				onClick: dojo.hitch(this, '_click'),
				checkItemAcceptance: dojo.hitch(this, function(target, src, pos){
					var targetID = this.tree.selectedNode.item.id[0];
					var prevChildren = this.tree.selectedNode.getParent().item.children;
					var pos;
					for(var i=0; i<prevChildren.length; i++){
						if(prevChildren[i].id[0] == targetID)
							pos = i;
					}
					this.dndOps.push({
						targetID: targetID,
						prevParentID: this.tree.selectedNode.getParent().item.id[0],
						prevPos: pos
					});
					return true;
				})
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
			dojo.subscribe("/dnd/drop", dojo.hitch(this, '_dnd'));
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