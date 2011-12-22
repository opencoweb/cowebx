//
// Cooperative tree app 
//
// Copyright (c) The Dojo Foundation 2011. All Rights Reserved.
// 
//

// # Concurrent ops
// # ==============
// # 1. insert new address in last pos	:	op=insert, topic=5, value={newAddressObj}, pos=1
// # 2. update home address city 		:	op=update, topic=10, value='San Fransico', pos=0
// # 3. update home address title		: 	op=update, topic=6, value='work', pos=0
// # 4. delete home address				: 	op=delete, topic=5, value=null, pos=0

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
			this.dndOps 	= [];
			this.globalID	=1000;
			window.foo 		= this;
			this._getData();
			this._buildButtons();	
					
			this.store 		= new Store({data:this.data});
			this.model 		= new Model({store:this.store, query:{id:"root"}});
			this.tree 		= this._buildTree();
			
			this.collab = coweb.initCollab({id:'foobar'});
			this.collab.subscribeSync('change.*', this, 'onRemoteChange');
			
			dojo.subscribe("/dnd/drop", dojo.hitch(this, '_dnd'));
			dojo.connect(window,'resize',this,'_resize');
			dojo.connect(dijit.byId('addDialog'),'isValid',this,'_addNode');
			dojo.connect(dijit.byId('addDialog'),'hide',this,'_hideDialog');
			dojo.connect(dijit.byId('editDialog'),'isValid',this,'_editNode');
			dojo.connect(dijit.byId('editDialog'),'hide',this,'_hideDialog');
			this._resize();
			
			var sess = coweb.initSession();
		    sess.prepare();
		},
		
		onLocalAddNode: function(obj){
			obj['force'] = true;
			// send sync with topic corresponding to parent id
			this.collab.sendSync('change.'+obj.parentID, obj, 'insert', obj.pos);
		},
		
		onRemoteAddNode: function(obj){
			//get parent item TODO: OPTIMIZE
			var selectedItem = this._getItemById(obj.value.parentID);
			
			if(selectedItem){
				//add a new item to store
				var newItem = this.store.newItem({ id: obj.value.id, name:obj.value.value});
				var parentID = obj.value.parentID;
				
				//update parent node's children in store & save
				var children = selectedItem.children;
				if(children == undefined)
					children = [];
				children = [newItem].concat(children);
				this.store.setValue(selectedItem,'children',children);
				this.store.save();

				//housekeeping
				this.globalID++;
			}else{
				throw new Error("Cotree: couldn't find parent node");
			}
		},

		onLocalDeleteNode: function(obj){
			obj['force'] = true;
			// send sync with topic corresponding to parent id
			this.collab.sendSync('change.'+obj.parentID, obj, 'delete', obj.pos);
		},
		
		onRemoteDeleteNode: function(obj){
			//1. remove node focus temporarily & save ref
			if(this.tree.selectedItem)
				var prevSelectedItemId = this.tree.selectedItem.id[0];
			this.tree.attr('selectedItem','_null');
			dojo.place('buttonContainer',document.body,'last');
			dojo.style('buttonContainer','display','none');
			
			//currently selected item
			var targetItem = this._getItemById(obj.value.id);
			//delete item from store & save
			this.store.deleteItem(targetItem);
			this.store.save();
			
			// show buttons if node in-tact
			this.tree.attr('selectedItem',prevSelectedItemId);
			this._click();
		},

		onLocalMoveNode: function(obj){
			// send sync with topic corresponding to parent id
			this.collab.sendSync('change.'+obj.prevParentID, obj, 'delete', obj.prevPos);
			this.collab.sendSync('change.'+obj.prevParentID, obj, 'insert', obj.newPos);
		},
		
		onRemoteMoveNode: function(obj){
			if(obj.type == 'delete'){
				//get parent item's children
				var prevParent = this._getItemById(obj.value.prevParentID);
				var children = prevParent.children;
				//remove targetItem from children
				children.splice(obj.value.prevPos, 1);
				//Update store
				this.store.setValue(prevParent,'children',children);
				this.store.save();
			}else if(obj.type == 'insert'){
				//get parent item's children
				var newItem = this._getItemById(obj.value.targetID);
				var newParent = this._getItemById(obj.value.newParentID);
				var children = newParent.children;
				//add targetItem to children in proper pos
				if(children == undefined)
					children = [];
				children = children.slice(0,obj.value.newPos).concat([newItem].concat(children.slice(obj.value.newPos)));
				//Update store
				this.store.setValue(newParent,'children',children);
				this.store.save();
			}
		},
		
		onLocalUpdateNode: function(obj){
			this.collab.sendSync('change.'+obj.id, obj, 'update', 0);
		},
		
		onRemoteUpdateNode: function(obj){
			var targetItem = this._getItemById(obj.value.id)
			var name = obj.value.name;
			this.store.setValue(targetItem,'name',name);
			this.store.save();
		},
		
		onRemoteChange: function(obj){
			if(obj.type == 'insert' && obj.value['force'])
				this.onRemoteAddNode(obj);
			else if(obj.type == 'delete' && obj.value['force'])
				this.onRemoteDeleteNode(obj);
			else if(obj.type == 'delete')
				this.onRemoteMoveNode(obj);
			else if(obj.type == 'insert')
				this.onRemoteMoveNode(obj);
			else if(obj.type == 'update')
				this.onRemoteUpdateNode(obj);
		},
		
		_refreshTree: function(){
			dijit.byId('thisTree').destroyRecursive();
			this.model = new Model({store:this.store, query:{id:"0"}});
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

		_addNode: function(e){
			//currently selected item
			var selectedItem = this.tree.selectedItem;
			var data = dijit.byId('addDialog').get('value');
			var name = data.name;
			if(name.length<1){
				alert('Node label cannot be left blank');
				return false;
			}
			//add a new node
			var newItem = this.store.newItem({ id: this.globalID.toString(), name:name});
			var parentID = selectedItem.id[0];
			//update parent node's children in store & save
			var children = selectedItem.children;
			if(children == undefined)
				children = [];
			children = [newItem].concat(children);
			this.store.setValue(selectedItem,'children',children);
			this.store.save();
			//trigger callback
			this.onLocalAddNode({
				id: this.globalID.toString(),
				parentID: parentID,
				value: name,
				pos: 0
			});
			//housekeeping
			dijit.byId('addName').set('value','');
			this.globalID++;
		},
		
		_deleteNode: function(e){
			if(this.tree.selectedNode != null){
				//Move buttons out and hide them
				dojo.place('buttonContainer',document.body,'last');
				dojo.style('buttonContainer','display','none');
				//currently selected item
				var targetItem = this.tree.selectedItem;
				//parent of currently selected item
				var parentItem = this.tree.selectedNode.getParent().item;
				//get pos
				var pos;
				for(var i=0; i<parentItem.children.length; i++){
					if(parentItem.children[i].id[0] == targetItem.id[0])
						pos = i;
				}
				//delete item from store & save
				this.store.deleteItem(targetItem);
				this.store.save();
				//trigger callback
				this.onLocalDeleteNode({
					id: targetItem.id[0],
					parentID: parentItem.id[0],
					pos:pos
				});
			}else{
				alert("You must select a node to delete.");
			}
		},
		
		_editNode: function(){
			var targetItem = this.tree.selectedItem;
			var data = dijit.byId('editDialog').get('value');
			var name = data.name;
			if(name.length<1){
				alert('Node label cannot be left blank');
				return false;
			}
			this.store.setValue(targetItem,'name',name);
			this.store.save();
			this.onLocalUpdateNode({
				id: targetItem.id[0],
				name: name
			});
		},
		
		_dnd: function(){
			var ops = this.dndOps[this.dndOps.length-1];
			var newChildren = this.tree.selectedNode.getParent().item.children;
			var pos;
			for(var i=0; i<newChildren.length; i++){
				if(newChildren[i].id[0] == ops['targetID'])
					pos = i;
			}
			ops['newPos'] = pos;
			ops['newParentID'] = this.tree.selectedNode.getParent().item.id[0];
			this.onLocalMoveNode(ops);
			this.dndOps = [];
		},
		
		_getData: function(){
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
			for(var i=0; i<this.store._arrayOfAllItems.length; i++){
				if(this.store._arrayOfAllItems[i] && this.store._arrayOfAllItems[i].id[0] == id)
					selectedItem = this.store._arrayOfAllItems[i];
			}
			return selectedItem;
		},
		
		_hideDialog: function(){
			dijit.byId('addName').set('value','');
			dijit.byId('editName').set('value','');
		},
		
		_resize: function(){
			dojo.style('appContainer','height',(document.body.offsetHeight-190)+'px');
			dojo.style('treeContainer','height',(document.body.offsetHeight-210)+'px');
		},
		
		_click: function(){
			var node = dojo.query('.dijitTreeRowSelected');
			if(node[0]){
				dojo.place('buttonContainer',node[0],'last');
				dojo.style('buttonContainer','display','inline-block');
			}
		}
		
	};
	
	dojo.ready(function() {
        app.init();
    });
});