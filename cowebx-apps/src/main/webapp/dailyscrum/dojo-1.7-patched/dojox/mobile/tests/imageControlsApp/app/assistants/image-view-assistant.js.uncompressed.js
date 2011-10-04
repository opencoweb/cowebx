/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/mobile/app/SceneAssistant"], function(dojo, dijit, dojox){
dojo.getObject("dojox.mobile.tests.imageControlsApp.app.assistants.image-view-assistant", 1);
/* builder delete begin
dojo.require("dojox.mobile.app.SceneAssistant");


 builder delete end */
dojo.declare("ImageViewAssistant", dojox.mobile.app.SceneAssistant, {
  
  setup: function(){
    console.log("In main assistant setup");
	
	var images = [
		"images/chris1_lg.jpg",
		"images/chris2_lg.jpg",
		"images/imageHoriz.jpg",
		"images/imageVert.jpg",
		"images/square.jpg"
	];
    
    // Instantiate widgets in the template HTML.
    this.controller.parse();
    
	var viewer = this.viewer = dijit.byId("imageView");
	
	this.viewer.set("leftUrl", images[0]);
	this.viewer.set("centerUrl", images[1]);
	this.viewer.set("rightUrl", images[2]);
	
	dojo.connect(dijit.byId("decZoom"), "onClick", function(){
		viewer.set("zoom", viewer.get("zoom") - 0.1);
	});
	dojo.connect(dijit.byId("incZoom"), "onClick", function(){
		viewer.set("zoom", viewer.get("zoom") + 0.1);
	});
	dojo.connect(dijit.byId("resetZoom"), "onClick", function(){
		viewer.set("zoom", 1);
	});
	dojo.connect(dijit.byId("toggleZoom"), "onClick", function(){
		if(viewer.get("zoom") > 1){
			console.log("setting animatedZoom to 1");
			viewer.set("animatedZoom", 1);
		}else{
			console.log("setting animatedZoom to 2");
			viewer.set("animatedZoom", 3);
		}
	});
	dojo.connect(dijit.byId("panLeft"), "onClick", function(){
		viewer.set("zoomCenter", {
			x: viewer.get("zoomCenterX") - 20,
			y: viewer.get("zoomCenterY")
		});
	});
	dojo.connect(dijit.byId("panRight"), "onClick", function(){
		viewer.set("zoomCenter", {
			x: viewer.get("zoomCenterX") + 20,
			y: viewer.get("zoomCenterY")
		});
	});
	dojo.connect(dijit.byId("panUp"), "onClick", function(){
		viewer.set("zoomCenter", {
			x: viewer.get("zoomCenterX"),
			y: viewer.get("zoomCenterY") - 20
		});
	});
	dojo.connect(dijit.byId("panDown"), "onClick", function(){
		viewer.set("zoomCenter", {
			x: viewer.get("zoomCenterX"),
			y: viewer.get("zoomCenterY") + 20
		});
	});
	
	var index = 1;
	
	dojo.connect(viewer, "onChange", function(direction){
		index += direction;
		
		console.log("Index = " + index);
		
		if(index > 0){
			viewer.set("leftUrl", images[index - 1]);
		}
		if(index < images.length - 1){
			viewer.set("rightUrl", images[index + 1]);
		}
	});
	
  },
  
  activate: function(){
    console.log("In main assistant activate");
    
    
  }
  
});
});
require(["dojox/mobile/tests/imageControlsApp/app/assistants/image-view-assistant"]);
