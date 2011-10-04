/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/lang/functional/object","dojox/lang/oo/mixin","dojox/lang/oo/rearrange"], function(dojo, dijit, dojox){
dojo.getObject("dojox.lang.tests.oo_mixin", 1);
/* builder delete begin
dojo.provide("dojox.lang.tests.oo_mixin");


 builder delete end */
/* builder delete begin
dojo.require("dojox.lang.functional.object");

 builder delete end */
/* builder delete begin
dojo.require("dojox.lang.oo.mixin");

 builder delete end */
/* builder delete begin
dojo.require("dojox.lang.oo.rearrange");


 builder delete end */
(function(){
	var df = dojox.lang.functional, oo = dojox.lang.oo,
		x = {a: 1, b: 2, c: 3},
		y = {c: 1, d: 2, e: 3, f: 4},
		z = oo.mixin({}, oo.filter(y, {d: "a", e: "b", f: ""})),
		q = dojo.clone(x),
		p = dojo.clone(y),
		print = function(v, i){ this.push("[" + i + "] = " + v); },
		show = function(o){ return df.forIn(o, print, []).sort().join(", "); };

	oo.mixin(q, y);
	oo.mixin(p, x);
	oo.rearrange(y, {d: "a", e: "b", f: ""});

	tests.register("dojox.lang.tests.oo_mixin", [
		function testMixin1(t){ t.assertEqual(df.keys(q).sort(), df.keys(p).sort()); },
		function testMixin2(t){ t.assertEqual(df.keys(x).sort(), df.keys(z).sort()); },
		function testRearrange(t){ t.assertEqual(df.keys(y).sort(), df.keys(z).sort()); }
	]);
})();

});
require(["dojox/lang/tests/oo_mixin"]);
