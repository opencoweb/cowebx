/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/wire/DataWire","dojox/data/XmlStore"],function(_1,_2,_3){_1.getObject("dojox.wire.tests.programmatic.DataWire",1);tests.register("dojox.wire.tests.programmatic.DataWire",[function test_DataWire_attribute(t){var _4=new _3.data.XmlStore();var _5=_4.newItem({tagName:"x"});new _3.wire.DataWire({dataStore:_4,object:_5,attribute:"y"}).setValue("Y");var _6=new _3.wire.DataWire({dataStore:_4,object:_5,attribute:"y"}).getValue();t.assertEqual("Y",_6);new _3.wire.DataWire({dataStore:_4,object:_5,attribute:"y.z"}).setValue("Z");_6=new _3.wire.DataWire({dataStore:_4,object:_5,attribute:"y.z"}).getValue();t.assertEqual("Z",_6);}]);});require(["dojox/wire/tests/programmatic/DataWire"]);