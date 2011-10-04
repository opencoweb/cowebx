/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/collections/Stack"], function(dojo, dijit, dojox){
dojo.getObject("dojox.collections.tests.Stack", 1);
/* builder delete begin
dojo.provide("dojox.collections.tests.Stack");

 builder delete end */
/* builder delete begin
dojo.require("dojox.collections.Stack");


 builder delete end */
tests.register("dojox.collections.tests.Stack", [
	function testCtor(t){
		var s=new dojox.collections.Stack(["foo","bar","test","bull"]);
		t.assertEqual(4, s.count);
	},
	function testClear(t){
		var s=new dojox.collections.Stack(["foo","bar","test","bull"]);
		s.clear();
		t.assertEqual(0, s.count);
	},
	function testClone(t){
		var s=new dojox.collections.Stack(["foo","bar","test","bull"]);
		var cloned=s.clone();
		t.assertEqual(s.count, cloned.count);
		t.assertEqual(s.toArray().join(), cloned.toArray().join());
	},
	function testContains(t){
		var s=new dojox.collections.Stack(["foo","bar","test","bull"]);
		t.assertTrue(s.contains("bar"));
		t.assertFalse(s.contains("faz"));
	},
	function testGetIterator(t){
		var s=new dojox.collections.Stack(["foo","bar","test","bull"]);
		var itr=s.getIterator();
		while(!itr.atEnd()){ itr.get(); }
		t.assertEqual("bull", itr.element);
	},
	function testPeek(t){
		var s=new dojox.collections.Stack(["foo","bar","test","bull"]);
		t.assertEqual("bull", s.peek());
	},
	function testPop(t){
		var s=new dojox.collections.Stack(["foo","bar","test","bull"]);
		t.assertEqual("bull", s.pop());
		t.assertEqual("test", s.pop());
	},
	function testPush(t){
		var s=new dojox.collections.Stack(["foo","bar","test","bull"]);
		s.push("bug");
		t.assertEqual("bug", s.peek());
	}
]);

});
require(["dojox/collections/tests/Stack"]);
