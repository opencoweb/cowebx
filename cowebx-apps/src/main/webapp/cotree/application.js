//
// Cooperative tree app 
//
// Copyright (c) The Dojo Foundation 2011. All Rights Reserved.
// 
//

define([
	'dojo',
	'dojo/store/Memory',
	'dijit/Tree',
	'./ObjectStoreModel',
	'dojo/store/Observable',
	'dijit/tree/dndSource',
	'dojo/aspect'],
function(dojo, Memory, Tree, Model, Observable, dndSource, aspect) {
	var app = {
		init: function(){
			this.data = [
	            {id:'root', name:'Phonebook'},
					{id: 1, name:'person', parent:'root'},
						{id: 2, name:'First Name', parent:1},
							{id: 3, name:'Paul', parent:2},
						{id: 4, name:'Last Name', parent:1},
							{id: 5, name:'Bouchon', parent:4},
						{id: 6, name:'Address', parent:1},
							{id: 7, name:'Work', parent:6},
								{id: 8, name:'Street', parent:7},
									{id: 9, name:'101 Foobar Way', parent:8},
								{id: 10, name:'City', parent:7},
									{id: 11, name:'Chapel Hill', parent:10},
								{id: 12, name:'State', parent:7},
									{id: 13, name:'North Carolina', parent:12},
					{id: 14, name:'person', parent:'root'},
						{id: 15, name:'First Name', parent:14},
							{id: 16, name:'Brian', parent:15},
						{id: 17, name:'Last Name', parent:14},
							{id: 18, name:'Burns', parent:17},
						{id: 19, name:'Address', parent:14},
							{id: 20, name:'Work', parent:19},
								{id: 21, name:'Street', parent:20},
									{id: 22, name:'107 JS Drive', parent:21},
								{id: 23, name:'City', parent:20},
									{id: 24, name:'Palo Alto', parent:23},
								{id: 25, name:'State', parent:20},
									{id: 26, name:'California', parent:25}
			];
			this.currID = 27;
			this.store 	= this._buildStore();
			this.model 	= this._buildModel();
			this.tree 	= this._buildTree();
			this._buildButtons();
			
			
			dojo.connect(window, 'onkeypress', this, function(e){
				if(e.keyCode == 13)
					console.log(this.tree);
			})
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
		//	   value	: value of deleted node
		// }
		onLocalDeleteNode: function(obj){

		},

		// local dnd callback
		// obj : {
		// }
		onLocalMoveNode: function(obj){

		},

		_buildButtons: function(){
			//Add
			var a = crisp.create({innerHTML:'add',domNode:dojo.byId('add'),width:"250px"});
			dojo.connect(a, 'onclick', this, function(){
				if(this.tree.selectedNode != null){
					this.store.add({id: this.currID, name:dojo.byId('label').value, parent: this.tree.selectedItem.id});
					this.onLocalAddNode({
						id: this.currID,
						parentID: this.tree.selectedItem.id,
						value: dojo.byId('label').value
					});
					this.currID++;
					dojo.style('label', 'color', 'lightgrey');
					dojo.byId('label').value = 'Node label...';
				}else{
					alert("To add a node, select a parent node in the tree and enter a label.");
				}
			});
			
			//Remove
			var d = crisp.create({innerHTML:'delete',domNode:dojo.byId('delete'),bgColor:'red',width:'250px'});
			dojo.connect(d, 'onclick', this, function(){
				this.store.remove(this.tree.selectedItem.id);
				this.onLocalDeleteNode({
					id: this.tree.selectedItem.id,
					parentID: this.tree.selectedItem.parent,
					value: dojo.byId('label').value
				});
			});
			
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
		
		_buildTree: function(){
			var tree = new Tree({
			    model: this.model,
				dndController: dndSource,
				betweenThreshold:5
			});
			tree.placeAt(dojo.byId('treeContainer'));
			return tree;
		},
		
		_buildModel: function(){
			var myModel = new Model({
		        store: this.store,
		        query: {id: 'root'}
		    });
			return myModel;
		},
		
		_buildStore: function(){
			var memoryStore = new Memory({
		        data: this.data,
		        getChildren: function(object){ return this.query({parent: object.id}); }
		    });
			aspect.around(memoryStore, "put", function(originalPut){
		        return function(obj, options){
		            if(options && options.parent)
		                obj.parent = options.parent.id;
		            return originalPut.call(memoryStore, obj, options);
		        }
		    });
			var observableStore = new Observable(memoryStore);
			return observableStore;
		}
	};
	
	dojo.ready(function() {
        app.init();
    });
});