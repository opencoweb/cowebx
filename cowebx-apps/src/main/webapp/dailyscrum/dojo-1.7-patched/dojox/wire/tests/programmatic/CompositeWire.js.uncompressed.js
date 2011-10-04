/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/wire/CompositeWire"], function(dojo, dijit, dojox){
dojo.getObject("dojox.wire.tests.programmatic.CompositeWire", 1);
/* builder delete begin
dojo.provide("dojox.wire.tests.programmatic.CompositeWire");


 builder delete end */
/* builder delete begin
dojo.require("dojox.wire.CompositeWire");


 builder delete end */
tests.register("dojox.wire.tests.programmatic.CompositeWire", [

	function test_CompositeWire_children(t){
		var source = {a: "A", b: "B"};
		var target = {};
		var children = {x: {property: "a"}, y: {property: "b"}};
		var value = new dojox.wire.CompositeWire({object: source, children: children}).getValue();
		t.assertEqual(source.a, value.x);
		t.assertEqual(source.b, value.y);
		new dojox.wire.CompositeWire({object: target, children: children}).setValue(value);
		t.assertEqual(source.a, target.a);
		t.assertEqual(source.b, target.b);

		// with argument
		target = {};
		value = new dojox.wire.CompositeWire({children: children}).getValue(source);
		t.assertEqual(source.a, value.x);
		t.assertEqual(source.b, value.y);
		new dojox.wire.CompositeWire({children: children}).setValue(value, target);
		t.assertEqual(source.a, target.a);
		t.assertEqual(source.b, target.b);

		// by array
		target = {};
		children = [{property: "a"}, {property: "b"}];
		value = new dojox.wire.CompositeWire({object: source, children: children}).getValue();
		t.assertEqual(source.a, value[0]);
		t.assertEqual(source.b, value[1]);
		new dojox.wire.CompositeWire({object: target, children: children}).setValue(value);
		t.assertEqual(source.a, target.a);
		t.assertEqual(source.b, target.b);

		// by array with argument
		target = {};
		value = new dojox.wire.CompositeWire({children: children}).getValue(source);
		t.assertEqual(source.a, value[0]);
		t.assertEqual(source.b, value[1]);
		new dojox.wire.CompositeWire({children: children}).setValue(value, target);
		t.assertEqual(source.a, target.a);
		t.assertEqual(source.b, target.b);
	}

]);

});
require(["dojox/wire/tests/programmatic/CompositeWire"]);
