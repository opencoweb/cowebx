/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/mobile/app/SceneAssistant"],function(_1,_2,_3){_1.getObject("dojox.mobile.tests.simpleListApp.app.assistants.main-assistant",1);_1.declare("MainAssistant",_3.mobile.app.SceneAssistant,{setup:function(){this.controller.parse();var _4=[{label:"Row 1"},{label:"Row 2"}];var _5=[{label:"Row 3"},{label:"Row 4"},{label:"Row 5"},{label:"Row 6"}];var _6=_2.byId("listWidget");_6.set("items",_4);var _7=this;_1.connect(_6,"onSelect",function(_8,_9,_a){try{_7.controller.query(".listInfo")[0].innerHTML="Selected ("+_9+") '"+_8.label+"'";}catch(e){}});this.connect(_2.byId("btn1"),"onClick",function(){_2.byId("listWidget").set("items",_4);});this.connect(_2.byId("btn2"),"onClick",function(){_2.byId("listWidget").set("items",_5);});},activate:function(){}});});require(["dojox/mobile/tests/simpleListApp/app/assistants/main-assistant"]);