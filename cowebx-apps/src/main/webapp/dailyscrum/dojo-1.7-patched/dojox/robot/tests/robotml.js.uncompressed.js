/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox"], function(dojo, dijit, dojox){
dojo.getObject("dojox.robot.tests.robotml", 1);
/* builder delete begin
dojo.provide("dojox.robot.tests.robotml");


 builder delete end */
try{
	if(dojo.isBrowser){
		doh.registerUrl("dojox.robot.tests.test_recorder", dojo.moduleUrl("dojox", "robot/tests/test_recorder.html"), 999999);
	}
}catch(e){
	doh.debug(e);
}

});
require(["dojox/robot/tests/robotml"]);
