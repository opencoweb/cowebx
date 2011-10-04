/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/highlight/tests/highlight"], function(dojo, dijit, dojox){
dojo.getObject("dojox.highlight.tests.module", 1);
/* builder delete begin
dojo.provide("dojox.highlight.tests.module");

 builder delete end */
//This file loads in all the test definitions.

try{
	//Load in the highlight module test.
	/* builder delete begin
dojo.require("dojox.highlight.tests.highlight");

 builder delete end */
}catch(e){
	doh.debug(e);
}

});
require(["dojox/highlight/tests/module"]);
