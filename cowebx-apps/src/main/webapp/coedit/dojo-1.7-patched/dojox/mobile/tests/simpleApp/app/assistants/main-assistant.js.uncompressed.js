/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/mobile/app/SceneAssistant"], function(dojo, dijit, dojox){
dojo.getObject("dojox.mobile.tests.simpleApp.app.assistants.main-assistant", 1);
/* builder delete begin
dojo.require("dojox.mobile.app.SceneAssistant");


 builder delete end */
dojo.declare("MainAssistant", dojox.mobile.app.SceneAssistant, {
  
  setup: function(){
    console.log("In main assistant setup");
    
    var appInfoNode = this.controller.query(".appInfoArea")[0];
    
    appInfoNode.innerHTML =
      "This app has the following info: \n"
        + dojo.toJson(dojox.mobile.app.info, true)
    
  },
  
  activate: function(){
    console.log("In main assistant activate");
    
    
  }
  
});
});
require(["dojox/mobile/tests/simpleApp/app/assistants/main-assistant"]);
