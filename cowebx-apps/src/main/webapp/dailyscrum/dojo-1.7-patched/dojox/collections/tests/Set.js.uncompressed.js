/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/collections/Set"], function(dojo, dijit, dojox){
dojo.getObject("dojox.collections.tests.Set", 1);
/* builder delete begin
dojo.provide("dojox.collections.tests.Set");

 builder delete end */
/* builder delete begin
dojo.require("dojox.collections.Set");


 builder delete end */
(function(){
	var dxcs=dojox.collections.Set;
	var a = ["apple","bear","candy","donut","epiphite","frank"];
	var b = ["bear","epiphite","google","happy","joy"];
	tests.register("dojox.collections.tests.Set", [
		function testUnion(t){
			var union=dxcs.union(a,b);
			t.assertEqual("apple,bear,candy,donut,epiphite,frank,google,happy,joy", union.toArray().join(','));
		},
		function testIntersection(t){
			var itsn=dxcs.intersection(a,b);
			t.assertEqual("bear,epiphite", itsn.toArray().join(","));
			t.assertEqual("bear", dxcs.intersection(["bear","apple"], ["bear"]));
		},
		function testDifference(t){
			var d=dxcs.difference(a,b);
			t.assertEqual("apple,candy,donut,frank",d.toArray().join(','));
		},
		function testIsSubSet(t){
			t.assertFalse(dxcs.isSubSet(a,["bear","candy"]));
			t.assertTrue(dxcs.isSubSet(["bear","candy"],a));
		},
		function testIsSuperSet(t){
			t.assertTrue(dxcs.isSuperSet(a,["bear","candy"]));
			t.assertFalse(dxcs.isSuperSet(["bear","candy"],a));
		}
	]);
})();

});
require(["dojox/collections/tests/Set"]);
