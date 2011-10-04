/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox"], function(dojo, dijit, dojox){
dojo.getObject("dojox.editor.tests.module", 1);
/* builder delete begin
dojo.provide("dojox.editor.tests.module");


 builder delete end */
try{
	var userArgs = window.location.search.replace(/[\?&](dojoUrl|testUrl|testModule)=[^&]*/g,"").replace(/^&/,"?");

	// Base editor functionality
	doh.registerUrl("dojox.editor.tests.robot.Editor_Smiley", dojo.moduleUrl("dojox","editor/tests/robot/Editor_Smiley.html"+userArgs), 99999999);

    
}catch(e){
	doh.debug(e);
}




});
require(["dojox/editor/tests/module"]);
