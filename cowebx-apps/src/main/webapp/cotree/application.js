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
	'dijit/dijit',
	'dojo/data/ItemFileWriteStore',
	'dijit/Tree',
	'dijit/tree/TreeStoreModel',
	'dijit/tree/dndSource',
	'dijit/Menu',
	'dijit/form/Button',
	'dojo/dnd/common',
	'dojo/dnd/Source'],
function(dojo, dijit, Store, Tree, Model, dndSource, Menu, Button) {
	var app = {
		init: function(){
			this.dndOps 	= [];
			this.globalID	=1000;
			window.foo 		= this;
			this._getData();
			this._buildButtons();	
					
			this.store 		= new Store({data:this.data});
			this.model 		= new Model({store:this.store, query:{id:"0"}});
			this.tree 		= this._buildTree();
			
			dojo.subscribe("/dnd/drop", dojo.hitch(this, function(obj){
				var ops = this.dndOps[this.dndOps.length-1];
				this.onLocalMoveNode(ops);
				this.dndOps = [];
			}));
		},
		
		// local add callback
		// obj : {
	 	//     id		: id of added node
		//     parentID	: id of added node's parent
		//	   value	: value of added node
		// }
		onLocalAddNode: function(obj){

		},

		// local delete callback
		// obj : {
	 	//     id		: id of deleted node
		//     parentID	: id of deleted node's parent
		// }
		onLocalDeleteNode: function(obj){

		},

		// local dnd callback
		// obj : {
		//     target	: node that's being moved 
		//	   src		: ref node
		//	   pos		: either 'before', 'after', or 'over'
		// }
		onLocalMoveNode: function(obj){
			
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
			var trigger = crisp.create({innerHTML:"+",domNode:dojo.byId('addTrigger'),bgColor:'green',width:'30px',height:'30px'});
			var a = crisp.create({innerHTML:'add',domNode:dojo.byId('add'),fontSize:'10px',height:"20px",bgColor:'green'});
			dojo.connect(a, 'onclick', this, '_addNode');
			
			//Remove
			var d = crisp.create({innerHTML:'-',domNode:dojo.byId('delete'),bgColor:'red',width:'30px',height:'30px'});
			dojo.connect(d, 'onclick', this, '_deleteNode');
			
			//Connect UI events
			dojo.connect(dojo.byId('label'),'onfocus',this,function(e){
				dojo.style(e.target,'color','black');
				if(e.target.value == 'Node label...')
					e.target.value = '';
			});
			
			dojo.connect(dojo.byId('label'),'onblur',this,function(e){
				if(e.target.value == ''){
					dojo.style(e.target,'color','lightgrey');
					e.target.value = 'Node label...';
				}	
			});
		},

		_addNode: function(){
			//currently selected item
			var selectedItem = this.tree.selectedItem;
			//if a parent node is selected and label is entered...
			if((selectedItem != null) && (dojo.byId('label').value != ('Node label...' || '')) ){
				//add a new node
				var newNode = this.store.newItem({ id: this.globalID.toString(), name:dojo.byId('label').value});
				var parentID = selectedItem.id[0];
				//update parent node's children in store & save
				var children = selectedItem.children;
				if(children == undefined)
					children = [];
				children.push(newNode);
				this.store.setValue(selectedItem,'children',children);
				this.store.save();
				//trigger callback
				this.onLocalAddNode({
					id: this.globalID.toString(),
					parentID: parentID,
					value: dojo.byId('label').value
				});
				//housekeeping
				this.globalID++;
				dojo.style('label', 'color', 'lightgrey');
				dojo.byId('label').value = 'Node label...';
			}else{
				alert("To add a node, select a parent node in the tree and enter a label.");
			}
		},
		
		_deleteNode: function(){
			if(this.tree.selectedNode != null){
				//currently selected item
				var targetItem = this.tree.selectedItem;
				//parent of currently selected item
				var parentItem = this.tree.selectedNode.getParent().item;
				//delete item from store & save
				this.store.deleteItem(targetItem);
				this.store.save();
				//trigger callback
				this.onLocalDeleteNode({
					id: targetItem.id[0],
					parentID: parentItem.id[0]
				});
			}else{
				alert("You must select a node to delete.");
			}
		},
		
		_renameNode: function(){
			
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
		}
	};
	
	dojo.ready(function() {
        app.init();
    });
});