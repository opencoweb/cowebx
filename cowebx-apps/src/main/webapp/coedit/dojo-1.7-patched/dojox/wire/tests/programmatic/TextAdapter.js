/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/wire/TextAdapter"],function(_1,_2,_3){_1.getObject("dojox.wire.tests.programmatic.TextAdapter",1);tests.register("dojox.wire.tests.programmatic.TextAdapter",[function test_TextAdapter_segments(t){var _4={a:"a",b:"b",c:"c"};var _5=[{property:"a"},{property:"b"},{property:"c"}];var _6=new _3.wire.TextAdapter({object:_4,segments:_5}).getValue();t.assertEqual("abc",_6);},function test_TextAdapter_delimiter(t){var _7={a:"a",b:"b",c:"c"};var _8=[{property:"a"},{property:"b"},{property:"c"}];var _9=new _3.wire.TextAdapter({object:_7,segments:_8,delimiter:"/"}).getValue();t.assertEqual("a/b/c",_9);}]);});require(["dojox/wire/tests/programmatic/TextAdapter"]);