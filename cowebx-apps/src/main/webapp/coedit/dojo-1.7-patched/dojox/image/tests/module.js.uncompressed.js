/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox"], function(dojo, dijit, dojox){
dojo.getObject("dojox.image.tests.module", 1);
/* builder delete begin
dojo.provide("dojox.image.tests.module");


 builder delete end */
try{

	doh.registerUrl("dojox.image.tests._base", dojo.moduleUrl("dojox.image.tests", "test_base.html"));
	doh.registerUrl("dojox.image.tests.Lightbox", dojo.moduleUrl("dojox.image.tests", "Lightbox.html"));
	doh.registerUrl("dojox.image.tests.onloads", dojo.moduleUrl("dojox.image.tests", "onloads.html"));
	
}catch(e){
	doh.debug(e);
}



});
require(["dojox/image/tests/module"]);
