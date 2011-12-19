//
// Cooperative tree app 
//
// Copyright (c) The Dojo Foundation 2011. All Rights Reserved.
// 
//

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
			selected=[];
			this.globalID=1000;
			window.foo = this;
			
			this.data = {
				identifier: 'id',
				label: 'name',
				items: [
				
				
				
				
					{ id: '0', name:'Foods', children:[ {_reference: '1'},  {_reference: '2'},  {_reference: '3'} ] },
						{ id: '1', name:'Fruits', children:[ {_reference: '4'} ] },
							{ id: '4', name:'Citrus', children:[ {_reference: 'def'} ] },
								{id: 'def',name:'foobar'},
						{ id: '2', name:'Vegetables'},
						{ id: '3', name:'Cereals'}
				]
			};
			this.store = new Store({data:this.data});
			this.model = new Model({store:this.store, query:{id:"0"}});
			this.tree = new Tree({
				id:'thisTree',
				'class':'container',
				model:this.model,
				betweenThreshold:5,
				persist:false,
				dndController:dndSource
			});
			this.tree.placeAt(dojo.byId('treeContainer'));
			this._buildButtons();
			
			dojo.subscribe("/dnd/drop", function(obj){
			    console.log('drop',obj);
			});
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
		// }
		onLocalMoveNode: function(obj){
			
		},
		
		// refreshes tree based on updates to model
		refreshTree: function(){
			dijit.byId('thisTree').destroyRecursive();
			this.model = new Model({store:this.store, query:{id:"0"}});
			this.tree = new Tree({
				id:'thisTree',
				'class':'container',
				model:this.model,
				betweenThreshold:5,
				persist:false,
				dndController:dndSource
			});
			this.tree.placeAt(dojo.byId('treeContainer'));
		},

		_buildButtons: function(){
			//Add
			var a = crisp.create({innerHTML:'add',domNode:dojo.byId('add'),width:"250px"});
			dojo.connect(a, 'onclick', this, '_addNode');
			
			//Remove
			var d = crisp.create({innerHTML:'delete',domNode:dojo.byId('delete'),bgColor:'red',width:'250px'});
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
			if((this.tree.selectedNode != null) && (dojo.byId('label').value != ('Node label...' || '')) ){
				var newNode = this.store.newItem({ id: this.globalID.toString(), name:dojo.byId('label').value});
				var parentID = this.tree.selectedItem.id[0];
				this.store.fetch({query:{id:parentID},onComplete: dojo.hitch(this,function(items){
					var children = this.tree.selectedItem.children;
					if(children == undefined)
						children = [];
					children.push(newNode);
					this.store.setValue(items[0],'children',children);
					this.store.save({onComplete: dojo.hitch(this, 'refreshTree')});
				})});
				this.onLocalAddNode({
					id: this.globalID.toString(),
					parentID: parentID,
					value: dojo.byId('label').value
				});
				this.globalID++;
				dojo.style('label', 'color', 'lightgrey');
				dojo.byId('label').value = 'Node label...';
			}else{
				alert("To add a node, select a parent node in the tree and enter a label.");
			}
		},
		
		_deleteNode: function(){
			if(this.tree.selectedNode != null){
				var targetItem = this.tree.selectedItem;
				var parentItem = this.tree.selectedNode.getParent().item;
				this.store.deleteItem(targetItem);
				this.store.save({onComplete:dojo.hitch(this, 'refreshTree')});
				this.onLocalDeleteNode({
					id: targetItem.id[0],
					parentID: parentItem.id[0]
				});
			}else{
				alert("You must select a node to delete.");
			}
		}
	};
	
	dojo.ready(function() {
        app.init();
    });
});