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
		   	this.currID = 0;
			this.store 	= this._buildStore();
			this.model 	= this._buildModel();
			this.tree 	= this._buildTree();
			console.log(this.tree);
			this._buildButtons();
		},
		
		// local add callback
		//obj has new node's id, parent node's id, and new node's value
		onLocalAddNode: function(obj){

		},

		// local delete callback
		//obj has new node's id, parent node's id, and new node's value
		onLocalDeleteNode: function(obj){

		},

		// local dnd callback
		onLocalMoveNode: function(obj){

		},

		_buildButtons: function(){
			//Add
			var a = crisp.create({innerHTML:'add',domNode:dojo.byId('add')});
			dojo.connect(a, 'onclick', this, function(){
				this.store.add({id: this.currID, name:dojo.byId('label').value, parent: this.tree.selectedItem.id});
				this.onLocalAddNode({
					id: this.currID,
					parentID: this.tree.selectedItem.id,
					value: dojo.byId('label').value
				});
				this.currID++;
			});
			
			//Remove
			var d = crisp.create({innerHTML:'delete',domNode:dojo.byId('delete')});
			dojo.connect(d, 'onclick', this, function(){
				this.store.remove(this.tree.selectedItem.id);
				this.onLocalDeleteNode({
					id: this.tree.selectedItem.id,
					parentID: this.tree.selectedItem.parent,
					value: dojo.byId('label').value
				});
			});
		},
		
		_buildTree: function(){
			var tree = new Tree({
			    model: this.model,
				dndController: dndSource
			});
			tree.placeAt(document.body);
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
		        data: [{ id: 'root', name:'Phonebook'}],
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