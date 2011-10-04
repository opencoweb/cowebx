/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/wire/tests/programmatic/_base","dojox/wire/tests/programmatic/Wire","dojox/wire/tests/programmatic/CompositeWire","dojox/wire/tests/programmatic/TableAdapter","dojox/wire/tests/programmatic/TreeAdapter","dojox/wire/tests/programmatic/TextAdapter"], function(dojo, dijit, dojox){
dojo.getObject("dojox.wire.tests.wire", 1);
/* builder delete begin
dojo.provide("dojox.wire.tests.wire");


 builder delete end */
try{
	/* builder delete begin
dojo.require("dojox.wire.tests.programmatic._base");
	
 builder delete end */
/* builder delete begin
dojo.require("dojox.wire.tests.programmatic.Wire");
	
 builder delete end */
dojo.requireIf(dojo.isBrowser, "dojox.wire.tests.programmatic.DataWire");
	dojo.requireIf(dojo.isBrowser, "dojox.wire.tests.programmatic.XmlWire");
	/* builder delete begin
dojo.require("dojox.wire.tests.programmatic.CompositeWire");
	
 builder delete end */
/* builder delete begin
dojo.require("dojox.wire.tests.programmatic.TableAdapter");
	
 builder delete end */
/* builder delete begin
dojo.require("dojox.wire.tests.programmatic.TreeAdapter");
	
 builder delete end */
/* builder delete begin
dojo.require("dojox.wire.tests.programmatic.TextAdapter");

 builder delete end */
}catch(e){
	doh.debug(e);
}

});
require(["dojox/wire/tests/wire"]);
