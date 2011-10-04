/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/mobile/app/SceneAssistant"], function(dojo, dijit, dojox){
dojo.getObject("dojox.mobile.tests.dialogApp.app.assistants.main-assistant", 1);
/* builder delete begin
dojo.require("dojox.mobile.app.SceneAssistant");


 builder delete end */
dojo.declare("MainAssistant", dojox.mobile.app.SceneAssistant, {
  
  setup: function(){
    console.log("In main assistant setup");
    
    // Instantiate widgets in the template HTML.
    this.controller.parse();
    
    var appInfoNode = this.controller.query(".appInfoArea")[0];
    
    appInfoNode.innerHTML =
      "This app has the following info: \n"
        + dojo.toJson(dojox.mobile.app.info, true);
        
    function handleChoose(value){
      appInfoNode.innerHTML = "Value selected: " + value;
      
    }
    
    
    var controller = this.controller;
    
    console.log("btn1 = ", dijit.byId("btn1"));
    
    dojo.connect(dijit.byId("btn1"), "onClick", function(){
      console.log("Clicked btn1");
      controller.showAlertDialog({
        title: "First Dialog",
        text: "This is a simple text message",
        onChoose: handleChoose,
        
        buttons: [
          {
            label: "Tap Me!",
            value: "tapped",
            "class": "mblBlueButton"
          }
        ]
      })
    });
    
    dojo.connect(dijit.byId("btn2"), "onClick", function(){
      console.log("Clicked btn2");
      controller.showAlertDialog({
        title: "Second Dialog",
        text: "These two buttons return different values, 'value one' and 'value two'",
        onChoose: handleChoose,
        
        buttons: [
          {
            label: "Im Am Button 1",
            value: "value one",
            "class": "mblBlueButton"
          },
          {
            label: "Im Am Button 2",
            value: "value two",
            "class": "mblBlueButton"
          }
        ]
      })
    });
    
  },
  
  activate: function(){
    console.log("In main assistant activate");
    
    
  }
  
});
});
require(["dojox/mobile/tests/dialogApp/app/assistants/main-assistant"]);
