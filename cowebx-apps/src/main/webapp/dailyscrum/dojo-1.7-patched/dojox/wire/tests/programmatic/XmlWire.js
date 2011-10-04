/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/wire/XmlWire"],function(_1,_2,_3){_1.getObject("dojox.wire.tests.programmatic.XmlWire",1);tests.register("dojox.wire.tests.programmatic.XmlWire",[function test_XmlWire_path(t){var _4={};var _5=_3.wire.create({object:_4,property:"element"});new _3.wire.XmlWire({object:_5,path:"/x/y/text()"}).setValue("Y");var _6=new _3.wire.XmlWire({object:_4,property:"element",path:"y/text()"}).getValue();t.assertEqual("Y",_6);new _3.wire.XmlWire({object:_4,property:"element",path:"y/@z"}).setValue("Z");_6=new _3.wire.XmlWire({object:_5,path:"/x/y/@z"}).getValue();t.assertEqual("Z",_6);var _7=_4.element.ownerDocument;var _8=_7.createElement("y");_8.appendChild(_7.createTextNode("Y2"));_4.element.appendChild(_8);_6=new _3.wire.XmlWire({object:_4.element,path:"y[2]/text()"}).getValue();t.assertEqual("Y2",_6);}]);});require(["dojox/wire/tests/programmatic/XmlWire"]);