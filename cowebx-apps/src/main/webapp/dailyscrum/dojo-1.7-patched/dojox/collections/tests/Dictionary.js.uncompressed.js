/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/collections/Dictionary"], function(dojo, dijit, dojox){
dojo.getObject("dojox.collections.tests.Dictionary", 1);
/* builder delete begin
dojo.provide("dojox.collections.tests.Dictionary");

 builder delete end */
/* builder delete begin
dojo.require("dojox.collections.Dictionary");


 builder delete end */
tests.register("dojox.collections.tests.Dictionary", [
	function testCtor(t){
		var d=new dojox.collections.Dictionary();
		t.assertTrue(d instanceof dojox.collections.Dictionary);
	},
	function testAdd(t){
		var d=new dojox.collections.Dictionary();
		d.add("foo","bar");
		t.assertEqual("bar", d.item("foo").valueOf());
	},
	function testClear(t){
		var d=new dojox.collections.Dictionary();
		d.add("foo","bar");
		d.clear()
		t.assertEqual(0, d.count);
	},
	function testClone(t){
		var d=new dojox.collections.Dictionary();
		d.add("baz","fab");
		d.add("buck","shot");
		d.add("apple","orange");
		var d2 = d.clone();
		t.assertTrue(d2.contains("baz"));
	},
	function testContains(t){
		var d=new dojox.collections.Dictionary();
		d.add("foo","bar");
		d.add("baz","fab");
		d.add("buck","shot");
		d.add("apple","orange");
		t.assertTrue(d.contains("baz"));
	},
	function testContainsKey(t){
		var d=new dojox.collections.Dictionary();
		d.add("foo","bar");
		d.add("baz","fab");
		d.add("buck","shot");
		d.add("apple","orange");
		t.assertTrue(d.containsKey("buck"));
	},
	function testContainsValue(t){
		var d=new dojox.collections.Dictionary();
		d.add("foo","bar");
		d.add("baz","fab");
		d.add("buck","shot");
		d.add("apple","orange");
		t.assertTrue(d.containsValue("shot"));
	},
	function testGetKeyList(t){
		var d=new dojox.collections.Dictionary();
		d.add("foo","bar");
		d.add("baz","fab");
		d.add("buck","shot");
		d.add("apple","orange");
		t.assertEqual("foo,baz,buck,apple", d.getKeyList().join(","));
	},
	function testGetValueList(t){
		var d=new dojox.collections.Dictionary();
		d.add("foo","bar");
		d.add("baz","fab");
		d.add("buck","shot");
		d.add("apple","orange");
		t.assertEqual("bar,fab,shot,orange", d.getValueList().join(","));
	},
	function testRemove(t){
		var d=new dojox.collections.Dictionary();
		d.add("foo","bar");
		d.add("baz","fab");
		d.add("buck","shot");
		d.add("apple","orange");
		d.remove("baz");
		t.assertEqual(3, d.count);
		t.assertEqual(undefined, d.item("baz"));
	}
]);

});
require(["dojox/collections/tests/Dictionary"]);
