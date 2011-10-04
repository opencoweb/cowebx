/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/mobile/app/SceneAssistant"],function(_1,_2,_3){_1.getObject("dojox.mobile.tests.simpleApp.app.assistants.main-assistant",1);_1.declare("MainAssistant",_3.mobile.app.SceneAssistant,{setup:function(){var _4=this.controller.query(".appInfoArea")[0];_4.innerHTML="This app has the following info: \n"+_1.toJson(_3.mobile.app.info,true);},activate:function(){}});});require(["dojox/mobile/tests/simpleApp/app/assistants/main-assistant"]);