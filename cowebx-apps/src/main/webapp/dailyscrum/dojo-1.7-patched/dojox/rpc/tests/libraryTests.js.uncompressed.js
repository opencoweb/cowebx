/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/rpc/tests/Yahoo","dojox/rpc/tests/Geonames","dojox/rpc/tests/Wikipedia","dojox/rpc/tests/FriendFeed"], function(dojo, dijit, dojox){
dojo.getObject("dojox.rpc.tests.libraryTests", 1);
/* builder delete begin
dojo.provide("dojox.rpc.tests.libraryTests");


 builder delete end */
try{
	/* builder delete begin
dojo.require("dojox.rpc.tests.Yahoo");
	
 builder delete end */
/* builder delete begin
dojo.require("dojox.rpc.tests.Geonames");
	
 builder delete end */
/* builder delete begin
dojo.require("dojox.rpc.tests.Wikipedia");
	
 builder delete end */
/* builder delete begin
dojo.require("dojox.rpc.tests.FriendFeed");

 builder delete end */
}catch(e){
	doh.debug(e);
}


});
require(["dojox/rpc/tests/libraryTests"]);
