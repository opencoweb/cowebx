/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox"], function(dojo, dijit, dojox){
dojo.getObject("dojox.rails.tests.module", 1);
/* builder delete begin
dojo.provide("dojox.rails.tests.module");


 builder delete end */
try{
	doh.registerUrl("dojox.rails", dojo.moduleUrl("dojox.rails", "tests/test_rails.html"));
}catch(e){
	doh.debug(e);
}
});
require(["dojox/rails/tests/module"]);
