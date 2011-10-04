/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/collections/ArrayList"], function(dojo, dijit, dojox){
dojo.getObject("dojox.collections.tests.ArrayList", 1);
/* builder delete begin
dojo.provide("dojox.collections.tests.ArrayList");

 builder delete end */
/* builder delete begin
dojo.require("dojox.collections.ArrayList");


 builder delete end */
tests.register("dojox.collections.tests.ArrayList", [
	function testCtor(t){
		var al=new dojox.collections.ArrayList(["foo","bar","test","bull"]);
		t.assertEqual(4, al.count);
	},
	function testAdd(t){
		var al=new dojox.collections.ArrayList(["foo","bar","test","bull"]);
		al.add("carp");
		t.assertEqual("foo,bar,test,bull,carp", al.toString());
		al.addRange(["oof","rab"]);
		t.assertEqual("foo,bar,test,bull,carp,oof,rab", al.toString());
	},
	function testClear(t){
		var al=new dojox.collections.ArrayList(["foo","bar","test","bull"]);
		al.clear();
		t.assertEqual(0, al.count);
	},
	function testClone(t){
		var al=new dojox.collections.ArrayList(["foo","bar","test","bull"]);
		var cloned=al.clone();
		t.assertEqual(al.toString(), cloned.toString());
	},
	function testContains(t){
		var al=new dojox.collections.ArrayList(["foo","bar","test","bull"]);
		t.assertTrue(al.contains("bar"));
		t.assertFalse(al.contains("faz"));
	},
	function testGetIterator(t){
		var al=new dojox.collections.ArrayList(["foo","bar","test","bull"]);
		var itr=al.getIterator();
		while(!itr.atEnd()){
			itr.get();
		}
		t.assertEqual("bull", itr.element);
	},
	function testIndexOf(t){
		var al=new dojox.collections.ArrayList(["foo","bar","test","bull"]);
		t.assertEqual(1, al.indexOf("bar"));
	},
	function testInsert(t){
		var al=new dojox.collections.ArrayList(["foo","bar","test","bull"]);
		al.insert(2, "baz");
		t.assertEqual(2, al.indexOf("baz"));
	},
	function testItem(t){
		var al=new dojox.collections.ArrayList(["foo","bar","test","bull"]);
		t.assertEqual("test", al.item(2));
	},
	function testRemove(t){
		var al=new dojox.collections.ArrayList(["foo","bar","test","bull"]);
		al.remove("bar");
		t.assertEqual("foo,test,bull", al.toString());
		t.assertEqual(3, al.count);
	},
	function testRemoveAt(t){
		var al=new dojox.collections.ArrayList(["foo","bar","test","bull"]);
		al.removeAt(3);
		t.assertEqual("foo,bar,test", al.toString());
		t.assertEqual(3, al.count);
	},
	function testReverse(t){
		var al=new dojox.collections.ArrayList(["foo","bar","test","bull"]);
		al.reverse();
		t.assertEqual("bull,test,bar,foo", al.toString());
	},
	function testSort(t){
		var al=new dojox.collections.ArrayList(["foo","bar","test","bull"]);
		al.sort();
		t.assertEqual("bar,bull,foo,test", al.toString());
	},
	function testToArray(t){
		var al=new dojox.collections.ArrayList(["foo","bar","test","bull"]);
		var a=al.toArray();
		t.assertEqual(a.join(","), al.toString());
	}
]);

});
require(["dojox/collections/tests/ArrayList"]);
