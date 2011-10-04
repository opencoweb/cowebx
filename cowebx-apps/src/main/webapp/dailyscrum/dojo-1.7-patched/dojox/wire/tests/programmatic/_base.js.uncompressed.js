/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/wire/_base"], function(dojo, dijit, dojox){
dojo.getObject("dojox.wire.tests.programmatic._base", 1);
/* builder delete begin
dojo.provide("dojox.wire.tests.programmatic._base");


 builder delete end */
/* builder delete begin
dojo.require("dojox.wire._base");


 builder delete end */
tests.register("dojox.wire.tests.programmatic._base", [

	function test_create(t){
		var wire = dojox.wire.create({});
		t.assertTrue(wire instanceof dojox.wire.Wire);

		wire = dojox.wire.create({property: "a"});
		t.assertTrue(wire instanceof dojox.wire.Wire);

		wire = dojox.wire.create({attribute: "a"});
		t.assertTrue(wire instanceof dojox.wire.DataWire);

		wire = dojox.wire.create({path: "a"});
		t.assertTrue(wire instanceof dojox.wire.XmlWire);

		wire = dojox.wire.create({children: "a"});
		t.assertTrue(wire instanceof dojox.wire.CompositeWire);

		wire = dojox.wire.create({columns: "a"});
		t.assertTrue(wire instanceof dojox.wire.TableAdapter);

		wire = dojox.wire.create({nodes: "a"});
		t.assertTrue(wire instanceof dojox.wire.TreeAdapter);

		wire = dojox.wire.create({segments: "a"});
		t.assertTrue(wire instanceof dojox.wire.TextAdapter);

		wire = dojox.wire.create({wireClass: "dojox.wire.DataWire"});
		t.assertTrue(wire instanceof dojox.wire.DataWire);
	},
	
	function test_transfer(t){
		var source = {a: "A"};
		var target = {};
		dojox.wire.transfer(
			{object: source, property: "a"},
			{object: target, property: "a"});
		t.assertEqual(source.a, target.a);
	},

	function test_connect(t){
		var trigger = {transfer: function() {}, transferArgument: function() {}};
		var source = {a: "A"};
		var target = {};
		dojox.wire.connect({scope: trigger, event: "transfer"},
			{object: source, property: "a"},
			{object: target, property: "a"});
		trigger.transfer();
		t.assertEqual(source.a, target.a);

		// with argument
		target = {};
		dojox.wire.connect({scope: trigger, event: "transferArgument"},
			{property: "[0].a"},
			{object: target, property: "a"});
		trigger.transferArgument(source);
		t.assertEqual(source.a, target.a);

		// by topic
		target = {};
		dojox.wire.connect({topic: "transfer"},
			{object: source, property: "a"},
			{object: target, property: "a"});
		dojo.publish("transfer");
		t.assertEqual(source.a, target.a);

		// by topic with argument
		target = {};
		dojox.wire.connect({topic: "transferArgument"},
			{property: "[0].a"},
			{object: target, property: "a"});
		dojo.publish("transferArgument", [source]);
		t.assertEqual(source.a, target.a);
	},

	function test_disconnect(t){
		var trigger = {transferDisconnect: function() {}};
		var source = {a: "A"};
		var target = {};
		var connection = dojox.wire.connect({scope: trigger, event: "transferDisconnect"},
			{object: source, property: "a"},
			{object: target, property: "a"});
		trigger.transferDisconnect();
		t.assertEqual(source.a, target.a);
		delete target.a;
		dojox.wire.disconnect(connection);
		trigger.transferDisconnect();
		t.assertEqual(undefined, target.a);

		// by topic
		target = {};
		connection = dojox.wire.connect({topic: "transferDisconnect"},
			{object: source, property: "a"},
			{object: target, property: "a"});
		dojo.publish("transferDisconnect");
		t.assertEqual(source.a, target.a);
		delete target.a;
		dojox.wire.disconnect(connection);
		dojo.publish("transferDisconnect");
		t.assertEqual(undefined, target.a);
	}

]);

});
require(["dojox/wire/tests/programmatic/_base"]);
