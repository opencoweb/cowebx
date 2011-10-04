/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/wire/TreeAdapter"],function(_1,_2,_3){_1.getObject("dojox.wire.tests.programmatic.TreeAdapter",1);tests.register("dojox.wire.tests.programmatic.TreeAdapter",[function test_TreeAdapter_nodes(t){var _4=[{a:"A1",b:"B1",c:"C1"},{a:"A2",b:"B2",c:"C2"},{a:"A3",b:"B3",c:"C3"}];var _5=[{title:{property:"a"},children:[{node:{property:"b"}},{title:{property:"c"}}]}];var _6=new _3.wire.TreeAdapter({object:_4,nodes:_5}).getValue();t.assertEqual(_4[0].a,_6[0].title);t.assertEqual(_4[1].b,_6[1].children[0].title);t.assertEqual(_4[2].c,_6[2].children[1].title);}]);});require(["dojox/wire/tests/programmatic/TreeAdapter"]);