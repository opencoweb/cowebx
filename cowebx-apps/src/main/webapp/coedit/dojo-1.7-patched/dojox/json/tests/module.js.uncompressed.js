/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/json/tests/ref","dojox/json/tests/schema","dojox/json/tests/query"], function(dojo, dijit, dojox){
dojo.getObject("dojox.json.tests.module", 1);
/* builder delete begin
dojo.provide("dojox.json.tests.module");


 builder delete end */
try{
	/* builder delete begin
dojo.require("dojox.json.tests.ref");
	
 builder delete end */
/* builder delete begin
dojo.require("dojox.json.tests.schema");
	
 builder delete end */
/* builder delete begin
dojo.require("dojox.json.tests.query");

 builder delete end */
}catch(e){
	doh.debug(e);
}


});
require(["dojox/json/tests/module"]);
