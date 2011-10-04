/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/collections"], function(dojo, dijit, dojox){
dojo.getObject("dojox.collections.tests._base", 1);
/* builder delete begin
dojo.provide("dojox.collections.tests._base");

 builder delete end */
/* builder delete begin
dojo.require("dojox.collections");


 builder delete end */
tests.register("dojox.collections.tests._base", [
	function testDictionaryEntry(t){
		var d=new dojox.collections.DictionaryEntry("foo","bar");
		t.assertEqual("bar", d.valueOf());
		t.assertEqual("bar", d.toString());
	},

	function testIterator(t){
		var itr=new dojox.collections.Iterator(["foo","bar","baz","zoo"]);
		t.assertEqual("foo", itr.element);	//	test initialization
		t.assertTrue(!itr.atEnd());
		t.assertEqual("foo", itr.get());	//	make sure the first get doesn't advance.
		t.assertEqual("bar", itr.get());
		t.assertEqual("baz", itr.get());
		t.assertEqual("zoo", itr.get());
		t.assertTrue(itr.atEnd());
		t.assertEqual(null, itr.get());

		itr.reset();
		t.assertTrue(!itr.atEnd());
		t.assertEqual("foo", itr.element);

		//	test map
		var a=itr.map(function(elm){
			return elm+"-mapped";
		});
		itr=new dojox.collections.Iterator(a);
		t.assertEqual("foo-mapped", itr.element);	//	test initialization
		t.assertTrue(!itr.atEnd());
		t.assertEqual("foo-mapped", itr.get());	//	make sure the first get doesn't advance.
		t.assertEqual("bar-mapped", itr.get());
		t.assertEqual("baz-mapped", itr.get());
		t.assertEqual("zoo-mapped", itr.get());
		t.assertTrue(itr.atEnd());
		t.assertEqual(null, itr.get());
	},

	function testDictionaryIterator(t){
		/*
			in the context of any of the Dictionary-based collections, the
			element would normally return a DictionaryEntry.  However, since
			the DictionaryIterator is really an iterator of pure objects,
			we will just test with an object here.  This means all property
			names are lost in the translation, but...that's why there's a
			DictionaryEntry object :)
		*/
		var itr=new dojox.collections.DictionaryIterator({
			first:"foo", second:"bar", third:"baz", fourth:"zoo"
		});
		t.assertEqual("foo", itr.element);	//	test initialization
		t.assertTrue(!itr.atEnd());
		t.assertEqual("foo", itr.get());	//	make sure the first get doesn't advance.
		t.assertEqual("bar", itr.get());
		t.assertEqual("baz", itr.get());
		t.assertEqual("zoo", itr.get());
		t.assertTrue(itr.atEnd());
		t.assertEqual(null, itr.get());

		itr.reset();
		t.assertTrue(!itr.atEnd());
		t.assertEqual("foo", itr.element);

		//	test map
		var a=itr.map(function(elm){
			return elm+"-mapped";
		});
		itr=new dojox.collections.Iterator(a);
		t.assertEqual("foo-mapped", itr.element);	//	test initialization
		t.assertTrue(!itr.atEnd());
		t.assertEqual("foo-mapped", itr.get());	//	make sure the first get doesn't advance.
		t.assertEqual("bar-mapped", itr.get());
		t.assertEqual("baz-mapped", itr.get());
		t.assertEqual("zoo-mapped", itr.get());
		t.assertTrue(itr.atEnd());
		t.assertEqual(null, itr.get());
	}
]);

});
require(["dojox/collections/tests/_base"]);
