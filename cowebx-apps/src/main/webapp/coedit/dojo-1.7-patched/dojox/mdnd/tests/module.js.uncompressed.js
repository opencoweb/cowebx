/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox"], function(dojo, dijit, dojox){
dojo.getObject("dojox.mdnd.tests.module", 1);
/* builder delete begin
dojo.provide("dojox.mdnd.tests.module");


 builder delete end */
try{
	dojo.require("dojox.mdnd.tests.unitTests.module");
	dojo.require("dojox.mdnd.tests.robot.module");
}catch(e){
	doh.debug(e);
}

});
require(["dojox/mdnd/tests/module"]);
