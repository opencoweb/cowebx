/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/wire/TextAdapter"], function(dojo, dijit, dojox){
dojo.getObject("dojox.wire.tests.programmatic.TextAdapter", 1);
/* builder delete begin
dojo.provide("dojox.wire.tests.programmatic.TextAdapter");


 builder delete end */
/* builder delete begin
dojo.require("dojox.wire.TextAdapter");


 builder delete end */
tests.register("dojox.wire.tests.programmatic.TextAdapter", [

	function test_TextAdapter_segments(t){
		var source = {a: "a", b: "b", c: "c"};
		var segments = [{property: "a"}, {property: "b"}, {property: "c"}];
		var value = new dojox.wire.TextAdapter({object: source, segments: segments}).getValue();
		t.assertEqual("abc", value);
	},

	function test_TextAdapter_delimiter(t){
		var source = {a: "a", b: "b", c: "c"};
		var segments = [{property: "a"}, {property: "b"}, {property: "c"}];
		var value = new dojox.wire.TextAdapter({object: source, segments: segments, delimiter: "/"}).getValue();
		t.assertEqual("a/b/c", value);
	}

]);

});
require(["dojox/wire/tests/programmatic/TextAdapter"]);
