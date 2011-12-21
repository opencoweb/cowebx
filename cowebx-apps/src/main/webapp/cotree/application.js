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
	'dojo/dnd/Source',],
function(dojo, coweb, dijit, Store, Tree, Model, dndSource, Menu, Button) {
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
			this._resize();
			
			var sess = coweb.initSession();
		    sess.prepare();
		},
		
		onLocalAddNode: function(obj){
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
			console.log(obj);
		},
		
		onRemoteMoveNode: function(){
			
		},
		
		onRemoteChange: function(obj){
			if(obj.type == 'insert')
				this.onRemoteAddNode(obj);
			else if(obj.type == 'delete')
				this.onRemoteDeleteNode(obj);
			else if(obj.type == 'update')
				this.onRemoteMoveNode(obj);
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
					this.dndOps.push({
						target: target,
						src: src,
						pos: pos
					});
					return true;
				})
			});
			tree.placeAt(dojo.byId('treeContainer'));
			return tree;
		},

		_buildButtons: function(){
			//Add
			dojo.connect(dojo.byId('add'), 'onclick', this, '_addNode');
			//Remove
			dojo.connect(dojo.byId('delete'), 'onclick', this, '_deleteNode');
		},

		_addNode: function(e){
			//currently selected item
			var selectedItem = this.tree.selectedItem;
			//if a parent node is selected and label is entered...
			if((selectedItem != null)){
				//add a new node
				var newItem = this.store.newItem({ id: this.globalID.toString(), name:'New node...'});
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
					value: 'New node...',
					pos: 0
				});
				//housekeeping
				this.globalID++;
			}else{
				alert("To add a node, select a parent node in the tree and enter a label.");
			}
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
		
		_dnd: function(){
			var ops = this.dndOps[this.dndOps.length-1];
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
		
		_resize: function(){
			dojo.style('appContainer','height',(document.body.offsetHeight-100)+'px');
			dojo.style('treeContainer','height',(document.body.offsetHeight-120)+'px');
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