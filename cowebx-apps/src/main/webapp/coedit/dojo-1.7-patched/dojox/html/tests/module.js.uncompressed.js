/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox"], function(dojo, dijit, dojox){
dojo.getObject("dojox.html.tests.module", 1);
/* builder delete begin
dojo.provide("dojox.html.tests.module");

 builder delete end */
try{
	dojo.requireIf(dojo.isBrowser, "dojox.html.tests.entities");
	dojo.requireIf(dojo.isBrowser, "dojox.html.tests.format");
}catch(e){
	doh.debug(e);
}


});
require(["dojox/html/tests/module"]);
