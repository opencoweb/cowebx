/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/wire/TreeAdapter"], function(dojo, dijit, dojox){
dojo.getObject("dojox.wire.tests.programmatic.TreeAdapter", 1);
/* builder delete begin
dojo.provide("dojox.wire.tests.programmatic.TreeAdapter");


 builder delete end */
/* builder delete begin
dojo.require("dojox.wire.TreeAdapter");


 builder delete end */
tests.register("dojox.wire.tests.programmatic.TreeAdapter", [

	function test_TreeAdapter_nodes(t){
		var source = [
			{a: "A1", b: "B1", c: "C1"},
			{a: "A2", b: "B2", c: "C2"},
			{a: "A3", b: "B3", c: "C3"}
		];
		var nodes = [
			{title: {property: "a"}, children: [
				{node: {property: "b"}},
				{title: {property: "c"}}
			]}
		];
		var value = new dojox.wire.TreeAdapter({object: source, nodes: nodes}).getValue();
		t.assertEqual(source[0].a, value[0].title);
		t.assertEqual(source[1].b, value[1].children[0].title);
		t.assertEqual(source[2].c, value[2].children[1].title);
	}

]);

});
require(["dojox/wire/tests/programmatic/TreeAdapter"]);
