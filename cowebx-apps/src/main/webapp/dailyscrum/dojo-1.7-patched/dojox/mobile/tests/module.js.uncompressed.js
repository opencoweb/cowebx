/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox"], function(dojo, dijit, dojox){
dojo.getObject("dojox.mobile.tests.module", 1);
/* builder delete begin
dojo.provide("dojox.mobile.tests.module");


 builder delete end */
try{
	dojo.require("dojox.mobile.tests.doh.module");
	dojo.require("dojox.mobile.tests.robot.module");

}catch(e){
	doh.debug(e);
}


});
require(["dojox/mobile/tests/module"]);
