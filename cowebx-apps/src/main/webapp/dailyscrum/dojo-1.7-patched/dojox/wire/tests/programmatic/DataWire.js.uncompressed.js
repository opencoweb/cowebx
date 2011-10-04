/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/wire/DataWire","dojox/data/XmlStore"], function(dojo, dijit, dojox){
dojo.getObject("dojox.wire.tests.programmatic.DataWire", 1);
/* builder delete begin
dojo.provide("dojox.wire.tests.programmatic.DataWire");


 builder delete end */
/* builder delete begin
dojo.require("dojox.wire.DataWire");

 builder delete end */
/* builder delete begin
dojo.require("dojox.data.XmlStore");


 builder delete end */
tests.register("dojox.wire.tests.programmatic.DataWire", [

	function test_DataWire_attribute(t){
		var store = new dojox.data.XmlStore();
		var item = store.newItem({tagName: "x"});
		new dojox.wire.DataWire({dataStore: store, object: item, attribute: "y"}).setValue("Y");
		var value = new dojox.wire.DataWire({dataStore: store, object: item, attribute: "y"}).getValue();
		t.assertEqual("Y", value);

		// nested attribute
		new dojox.wire.DataWire({dataStore: store, object: item, attribute: "y.z"}).setValue("Z");
		value = new dojox.wire.DataWire({dataStore: store, object: item, attribute: "y.z"}).getValue();
		t.assertEqual("Z", value);
	}

]);

});
require(["dojox/wire/tests/programmatic/DataWire"]);
