/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/lang/docs","dijit/ColorPalette","dijit/Dialog"], function(dojo, dijit, dojox){
dojo.getObject("dojox.lang.tests.docs", 1);
/* builder delete begin
dojo.provide("dojox.lang.tests.docs");


 builder delete end */
/* builder delete begin
dojo.require("dojox.lang.docs");

 builder delete end */
/* builder delete begin
dojo.require("dijit.ColorPalette");


 builder delete end */
tests.register("dojox.lang.tests.docs", [
	function notReady(t){
		t.is(!dijit.ColorPalette.description, true);
	},
	function pastClassHasSchema(t){
		dojox.lang.docs.init();
		t.is(!!dijit.ColorPalette.description, true);
		dojox.lang.docs.init(); // make sure it can be called twice without any problems
		t.is(!!dijit.ColorPalette.properties.defaultTimeout.description, true);
		t.is(dijit.ColorPalette.properties.defaultTimeout.type, "number");
		t.is(dijit.ColorPalette.methods.onChange.parameters[0].type, "string");
		t.is(dijit.ColorPalette.methods.onChange.parameters[0].name, "color");
		t.is(dijit.ColorPalette["extends"], dijit._Widget);
	},
	function futureClassHasSchema(t){
		/* builder delete begin
dojo.require("dijit.Dialog");
		
 builder delete end */
t.is(!!dijit.Dialog.description, true);
		t.is(!!dijit.Dialog.properties.autofocus.description, true);
		t.is(dijit.Dialog.properties.autofocus.type, "boolean");
	},
	function testSchema(t){
		
	}
]);

});
require(["dojox/lang/tests/docs"]);
