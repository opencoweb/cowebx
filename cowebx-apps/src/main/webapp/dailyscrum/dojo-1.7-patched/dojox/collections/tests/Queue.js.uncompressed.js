/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/collections/Queue"], function(dojo, dijit, dojox){
dojo.getObject("dojox.collections.tests.Queue", 1);
/* builder delete begin
dojo.provide("dojox.collections.tests.Queue");

 builder delete end */
/* builder delete begin
dojo.require("dojox.collections.Queue");


 builder delete end */
tests.register("dojox.collections.tests.Queue", [
	function testCtor(t){
		var q=new dojox.collections.Queue(["foo","bar","test","bull"]);
		t.assertEqual(4, q.count);
	},
	function testClear(t){
		var q=new dojox.collections.Queue(["foo","bar","test","bull"]);
		q.clear();
		t.assertEqual(0, q.count);
	},
	function testClone(t){
		var q=new dojox.collections.Queue(["foo","bar","test","bull"]);
		var cloned=q.clone();
		t.assertEqual(q.count, cloned.count);
		t.assertEqual(q.toArray().join(), cloned.toArray().join());
	},
	function testContains(t){
		var q=new dojox.collections.Queue(["foo","bar","test","bull"]);
		t.assertTrue(q.contains("bar"));
		t.assertFalse(q.contains("faz"));
	},
	function testGetIterator(t){
		var q=new dojox.collections.Queue(["foo","bar","test","bull"]);
		var itr=q.getIterator();
		while(!itr.atEnd()){ itr.get(); }
		t.assertEqual("bull", itr.element);
	},
	function testPeek(t){
		var q=new dojox.collections.Queue(["foo","bar","test","bull"]);
		t.assertEqual("foo", q.peek());
	},
	function testDequeue(t){
		var q=new dojox.collections.Queue(["foo","bar","test","bull"]);
		t.assertEqual("foo", q.dequeue());
		t.assertEqual("bar,test,bull", q.toArray().join(","));
	},
	function testEnqueue(t){
		var q=new dojox.collections.Queue(["foo","bar","test","bull"]);
		q.enqueue("bull");
		t.assertEqual("bull", q.toArray().pop());
	}
]);

});
require(["dojox/collections/tests/Queue"]);
