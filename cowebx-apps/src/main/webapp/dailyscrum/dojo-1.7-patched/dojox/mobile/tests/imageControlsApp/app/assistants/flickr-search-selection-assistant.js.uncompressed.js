/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/mobile/app/SceneAssistant"], function(dojo, dijit, dojox){
dojo.getObject("dojox.mobile.tests.imageControlsApp.app.assistants.flickr-search-selection-assistant", 1);
/* builder delete begin
dojo.require("dojox.mobile.app.SceneAssistant");


 builder delete end */
dojo.declare("FlickrSearchSelectionAssistant", dojox.mobile.app.SceneAssistant, {
  
	setup: function(){
    
		// Instantiate widgets in the template HTML.
		this.controller.parse();
		
		var scenes = [
		  {
		    label: "Interesting Photos",
			scene: "flickr-image-view",
			type: "interesting"
		  },
		  {
		    label: "Search for Group",
			scene: "flickr-search-group",
			type: "group"
		  },
		  {
		    label: "Search for Text",
			scene: "flickr-image-thumb-view",
			type: "text"
		  },
		  {
		    label: "Search Tags",
			scene: "flickr-image-thumb-view",
			type: "tag"
		  }
		];
		
		var listWidget = dijit.byId("browseFlickrList");
		listWidget.set("items", scenes);
		
		var _this = this;
		
		dojo.connect(listWidget, "onSelect", function(data, index, rowNode){
			// Push the chosen scene, and pass in the data type, if any.
			// The serach scene uses the "type" to determine
			// what to search for
			_this.controller.stageController.pushScene(data.scene, {
				type: data.type
			});
		});
  },
  
  activate: function(){
    
    
  }
  
});
});
require(["dojox/mobile/tests/imageControlsApp/app/assistants/flickr-search-selection-assistant"]);
