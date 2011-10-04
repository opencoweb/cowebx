/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/mobile/app/SceneAssistant"],function(_1,_2,_3){_1.getObject("dojox.mobile.tests.imageControlsApp.app.assistants.flickr-search-selection-assistant",1);_1.declare("FlickrSearchSelectionAssistant",_3.mobile.app.SceneAssistant,{setup:function(){this.controller.parse();var _4=[{label:"Interesting Photos",scene:"flickr-image-view",type:"interesting"},{label:"Search for Group",scene:"flickr-search-group",type:"group"},{label:"Search for Text",scene:"flickr-image-thumb-view",type:"text"},{label:"Search Tags",scene:"flickr-image-thumb-view",type:"tag"}];var _5=_2.byId("browseFlickrList");_5.set("items",_4);var _6=this;_1.connect(_5,"onSelect",function(_7,_8,_9){_6.controller.stageController.pushScene(_7.scene,{type:_7.type});});},activate:function(){}});});require(["dojox/mobile/tests/imageControlsApp/app/assistants/flickr-search-selection-assistant"]);