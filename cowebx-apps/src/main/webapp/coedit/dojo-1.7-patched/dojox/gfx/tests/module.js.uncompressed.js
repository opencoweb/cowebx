/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/gfx/tests/matrix","dojox/gfx/tests/decompose"], function(dojo, dijit, dojox){
dojo.getObject("dojox.gfx.tests.module", 1);
/* builder delete begin
dojo.provide("dojox.gfx.tests.module");


 builder delete end */
try{
	/* builder delete begin
dojo.require("dojox.gfx.tests.matrix");
	
 builder delete end */
/* builder delete begin
dojo.require("dojox.gfx.tests.decompose");
	
 builder delete end */
doh.registerUrl("GFX: Utils", dojo.moduleUrl("dojox", "gfx/tests/test_utils.html"), 3600000);
}catch(e){
	doh.debug(e);
}


});
require(["dojox/gfx/tests/module"]);
