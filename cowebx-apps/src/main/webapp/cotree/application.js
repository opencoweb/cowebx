//
// Cooperative tree app 
//
// Copyright (c) The Dojo Foundation 2011. All Rights Reserved.
// 
//

define([
	'dijit/dijit',
	'dojo/data/ItemFileWriteStore',
	'dijit/Tree',
	'dijit/tree/TreeStoreModel',
	'dijit/tree/_dndSelector',
	'dijit/Menu',
	'dijit/form/Button',
	'dojo/dnd/common',
	'dojo/dnd/Source'

], function() {
		dijit.Tree.prototype.dndController = 'dijit.tree._dndSelector';
		selected=[];
		globalId=1000;
		lastSelected=null;
		var app = {
			init: function(){		
				//record the selection from tree 1
				dojo.subscribe("myTree", null, function(message){
					if(message.event=="execute"){
						console.log("Tree1 Select: ",dijit.byId("myTree").store.getLabel(message.item));
						lastSelected=selected["myTree"]=message.item;
					}
				});

				//record the selection from tree 2
				dojo.subscribe("myTree2", null, function(message){
					if(message.event=="execute"){
						console.log("Tree2 Select: ",dijit.byId("myTree2").store.getLabel(message.item));
						lastSelected=selected["myTree2"]=message.item;
					}
				});

				//connect to the add button and have it add a new container to the store as necessary
				dojo.connect(dijit.byId("addButton"), "onClick", function(){
					var pInfo = {
						parent: lastSelected,
						attribute: "children"
					};

					//store.newItem({name: dojo.byId('newCat').value, id:globalId++, numberOfItems:dojo.byId('numItems').value}, pInfo);
					myStore.newItem({name: dojo.byId('newCat').value, numberOfItems:0,id:globalId++}, pInfo);
				});

				//since we don't have a server, we're going to connect to the store and do a few things the server/store combination would normal be taking care of for us
				dojo.connect(myStore, "onNew", function(item, pInfo){
					var p = pInfo && pInfo.item;
					if(p){
						var currentTotal = myStore.getValues(p, "numberOfItems")[0];
						myStore.setValue(p, "numberOfItems", ++currentTotal);
					}

				});	
			},
			
			//create a custom label for tree one consisting of the label property pluss the value of the numberOfItems Column
			catTreeCustomLabel: function(item){
				var label = myStore.getLabel(item);
				var num = myStore.hasAttribute(item, "numberOfItems") ? myStore.getValues(item,"numberOfItems") : "?";
				return label + ' (' + num+ ')';
			},

			//on item tree , we want to drop on containers, the root node itself, or between items in the containers
			itemTreeCheckItemAcceptance: function (node,source,position){
				source.forInSelectedItems(function(item){
					console.log("testing to drop item of type " + item.type[0] + " and data " + item.data + ", position " + position);
				});
				var item = dijit.getEnclosingWidget(node).item;
				if(item && (item.root || myStore.hasAttribute(item,"numberOfItems"))){
					return true;
				}
				return position != "over";

			},

			//on collection tree, only accept itself as the source tree
			collectionTreeCheckItemAcceptance:function (node,source,position){
				return source.tree && source.tree.id == "collectionsTree";
			},

			dndAccept:function (source,nodes){
				return this.tree.id != "myTree";
			},

			getIcon:function (item){
				if(!item || myStore.hasAttribute(item, "numberOfItems")){
					return "myFolder";
				}
				return "myItem"
			}
		};
		
		dojo.ready(function() {
	        app.init();
	    });
	}
);