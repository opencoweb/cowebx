/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/mobile/app/SceneAssistant"], function(dojo, dijit, dojox){
dojo.getObject("dojox.mobile.tests.simpleListApp.app.assistants.main-assistant", 1);
/* builder delete begin
dojo.require("dojox.mobile.app.SceneAssistant");


 builder delete end */
dojo.declare("MainAssistant", dojox.mobile.app.SceneAssistant, {
  
  setup: function(){
    console.log("In main assistant setup");
    
    this.controller.parse();
    console.log("In main assistant setup 2");
    
    var data1 = [
      {
        label: "Row 1"
      },
      {
        label: "Row 2"
      }
    ];
    var data2 = [
      {
        label: "Row 3"
      },
      {
        label: "Row 4"
      },
      {
        label: "Row 5"
      },
      {
        label: "Row 6"
      }
    ];
    
    var listWidget = dijit.byId("listWidget");
    listWidget.set("items", data1);
    
    var _this = this;
    
    dojo.connect(listWidget, "onSelect", function(data, index, rowNode){
      try {
        console.log("selected data item  ", data);
        _this.controller.query(".listInfo")[0].innerHTML
                = "Selected (" + index + ") '" + data.label + "'";
      } catch(e){
        console.log("caught ", e);
      }
    });
    
    this.connect(dijit.byId("btn1"), "onClick", function(){
      dijit.byId("listWidget").set("items", data1);
    });
    this.connect(dijit.byId("btn2"), "onClick", function(){
      dijit.byId("listWidget").set("items", data2);
    });
    
    
  },
  
  activate: function(){
    console.log("In main assistant activate");
    
    
  }
  
});
});
require(["dojox/mobile/tests/simpleListApp/app/assistants/main-assistant"]);
