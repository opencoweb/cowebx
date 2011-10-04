/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/mobile/app/SceneAssistant"], function(dojo, dijit, dojox){
dojo.getObject("dojox.mobile.tests.imageControlsApp.app.assistants.main-assistant", 1);
/* builder delete begin
dojo.require("dojox.mobile.app.SceneAssistant");


 builder delete end */
dojo.declare("MainAssistant", dojox.mobile.app.SceneAssistant, {
	setup: function(){
		console.log("In main assistant setup");
		
		this.controller.parse();
		
		var scenes = [
		  {
		    label: "Simple ImageView Test",
			scene: "image-view"
		  },
		  {
		    label: "Flickr ImageView Test",
			scene: "flickr-image-view"
		  },
		  {
		    label: "Browse Flickr",
			scene: "flickr-search-selection"
		  }
		];
		
		var listWidget = dijit.byId("listWidget");
		listWidget.set("items", scenes);
		
		var _this = this;
		
		dojo.connect(listWidget, "onSelect", function(data, index, rowNode){
		  _this.controller.stageController.pushScene(data.scene);
		});
  },
  
  activate: function(){
    console.log("In main assistant activate");
    
    
  }
});
});
require(["dojox/mobile/tests/imageControlsApp/app/assistants/main-assistant"]);
