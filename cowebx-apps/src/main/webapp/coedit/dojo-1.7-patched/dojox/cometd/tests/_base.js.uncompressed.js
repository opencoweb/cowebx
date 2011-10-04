/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/cometd"], function(dojo, dijit, dojox){
dojo.getObject("dojox.cometd.tests._base", 1);
/* builder delete begin
dojo.provide("dojox.cometd.tests._base");

 builder delete end */
/* builder delete begin
dojo.require("dojox.cometd");


 builder delete end */
tests.register("dojox.cometd.tests._base", [

	function basicSyntaxCheck(t){
		// w00t, we made it! (FIXME: how to unit test basic functionality?)
		// FIXME: gregw? include basicSyntax tests for other transports?
		t.assertTrue(true);
	},

	function basicInitCheck(t){
		var d = dojox.cometd.init("http://www.sitepen.com:9000/cometd");
		if(d){
			t.assertTrue(true);
		}
	},

	function basicSubscribeCheck(t){
		dojox.cometd.subscribe("/basic/unit/test", function(e){
			console.log("message received", e);
		});
		t.assertTrue(true);
	},

	function basicPublishCheck(t){
		dojox.cometd.publish("/basic/unit/test", [{ message: "unit test" }]);
		t.assertTrue(true);
	}

]);

});
require(["dojox/cometd/tests/_base"]);
