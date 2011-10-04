/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/lang/docs","dijit/ColorPalette","dijit/Dialog"],function(_1,_2,_3){_1.getObject("dojox.lang.tests.docs",1);tests.register("dojox.lang.tests.docs",[function notReady(t){t.is(!_2.ColorPalette.description,true);},function pastClassHasSchema(t){_3.lang.docs.init();t.is(!!_2.ColorPalette.description,true);_3.lang.docs.init();t.is(!!_2.ColorPalette.properties.defaultTimeout.description,true);t.is(_2.ColorPalette.properties.defaultTimeout.type,"number");t.is(_2.ColorPalette.methods.onChange.parameters[0].type,"string");t.is(_2.ColorPalette.methods.onChange.parameters[0].name,"color");t.is(_2.ColorPalette["extends"],_2._Widget);},function futureClassHasSchema(t){t.is(!!_2.Dialog.description,true);t.is(!!_2.Dialog.properties.autofocus.description,true);t.is(_2.Dialog.properties.autofocus.type,"boolean");},function testSchema(t){}]);});require(["dojox/lang/tests/docs"]);