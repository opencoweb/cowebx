/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/wire/TableAdapter"], function(dojo, dijit, dojox){
dojo.getObject("dojox.wire.tests.programmatic.TableAdapter", 1);
/* builder delete begin
dojo.provide("dojox.wire.tests.programmatic.TableAdapter");


 builder delete end */
/* builder delete begin
dojo.require("dojox.wire.TableAdapter");


 builder delete end */
tests.register("dojox.wire.tests.programmatic.TableAdapter", [

	function test_TableAdapter_columns(t){
		var source = [
			{a: "A1", b: "B1", c: "C1"},
			{a: "A2", b: "B2", c: "C2"},
			{a: "A3", b: "B3", c: "C3"}
		];
		var columns = {x: {property: "a"}, y: {property: "b"}, z: {property: "c"}};
		var value = new dojox.wire.TableAdapter({object: source, columns: columns}).getValue();
		t.assertEqual(source[0].a, value[0].x);
		t.assertEqual(source[1].b, value[1].y);
		t.assertEqual(source[2].c, value[2].z);
	}

]);

});
require(["dojox/wire/tests/programmatic/TableAdapter"]);
