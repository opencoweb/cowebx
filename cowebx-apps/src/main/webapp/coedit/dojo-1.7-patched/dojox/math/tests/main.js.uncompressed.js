/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/math/tests/math","dojox/math/tests/stats","dojox/math/tests/round","dojox/math/tests/BigInteger","dojox/math/tests/random"], function(dojo, dijit, dojox){
dojo.getObject("dojox.math.tests.main", 1);
/* builder delete begin
dojo.provide("dojox.math.tests.main");


 builder delete end */
try{
	// functional block
	/* builder delete begin
dojo.require("dojox.math.tests.math");
	
 builder delete end */
/* builder delete begin
dojo.require("dojox.math.tests.stats");
	
 builder delete end */
/* builder delete begin
dojo.require("dojox.math.tests.round");
	
 builder delete end */
/* builder delete begin
dojo.require("dojox.math.tests.BigInteger");
	
 builder delete end */
/* builder delete begin
dojo.require("dojox.math.tests.random");

 builder delete end */
}catch(e){
	doh.debug(e);
}

});
require(["dojox/math/tests/main"]);
