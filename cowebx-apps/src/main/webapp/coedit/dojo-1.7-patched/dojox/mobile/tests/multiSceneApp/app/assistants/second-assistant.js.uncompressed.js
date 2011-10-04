/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/mobile/app/SceneAssistant"], function(dojo, dijit, dojox){
dojo.getObject("dojox.mobile.tests.multiSceneApp.app.assistants.second-assistant", 1);
/* builder delete begin
dojo.require("dojox.mobile.app.SceneAssistant");


 builder delete end */
dojo.declare("SecondAssistant", dojox.mobile.app.SceneAssistant, {
  
  setup: function(){
    console.log("In second assistant setup");
    
    // Instantiate widgets in the template HTML.
    this.controller.parse();
    
    var _this = this;
    var launcher = dijit.byId("secondSceneLauncher");
    this.connect(dijit.byId("btn1"), "onClick", function(){
      _this.controller.stageController.popScene("Button 1");
    });
    this.connect(dijit.byId("btn2"), "onClick", function(){
      _this.controller.stageController.pushScene("third", "Came from second scene");
    });
  },
  
  activate: function(data){
    console.log("In main assistant activate");
    var node = this.controller.query(".inputData")[0];
    if(data) {
      node.innerHTML = "Scene got the data: " + data;
    } else {
      node.innerHTML = "Scene did not receive data";
    }
  }
  
});
});
require(["dojox/mobile/tests/multiSceneApp/app/assistants/second-assistant"]);
