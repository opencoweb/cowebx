/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/mobile/app/SceneAssistant"],function(_1,_2,_3){_1.getObject("dojox.mobile.tests.imageControlsApp.app.assistants.main-assistant",1);_1.declare("MainAssistant",_3.mobile.app.SceneAssistant,{setup:function(){this.controller.parse();var _4=[{label:"Simple ImageView Test",scene:"image-view"},{label:"Flickr ImageView Test",scene:"flickr-image-view"},{label:"Browse Flickr",scene:"flickr-search-selection"}];var _5=_2.byId("listWidget");_5.set("items",_4);var _6=this;_1.connect(_5,"onSelect",function(_7,_8,_9){_6.controller.stageController.pushScene(_7.scene);});},activate:function(){}});});require(["dojox/mobile/tests/imageControlsApp/app/assistants/main-assistant"]);