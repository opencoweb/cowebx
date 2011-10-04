/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/highlight","dojox/highlight/languages/_all"], function(dojo, dijit, dojox){
dojo.getObject("dojox.highlight.tests.highlight", 1);
/* builder delete begin
dojo.provide("dojox.highlight.tests.highlight");


 builder delete end */
/* builder delete begin
dojo.require("dojox.highlight");

 builder delete end */
/* builder delete begin
dojo.require("dojox.highlight.languages._all");


 builder delete end */
doh.register("dojox.highlight.tests.highlight", [
	function test_validjavascript(){
		//summary: Test a valid javascript block is highlighted correctly
		var unformatted = "console.debug('hello'); /*Hi*/";
		var expected = "console.debug(<span class=\"string\">'hello'</span>); <span class=\"comment\">/*Hi*/</span>";
		var result = dojox.highlight.processString(unformatted, "javascript");
		doh.assertEqual(expected, result.result);
		doh.assertTrue(!result.partialResult);
		doh.assertEqual("javascript", result.langName);
	},
	function test_invalidjavascript(){
		//summary: Test an invalid javascript block with partial result
		var unformatted = "console.debug('hello);\n /*Hi*/";
		//                               ^_ unmatched quote
		var expected = "console.debug(<span class=\"string\">";
		var result = dojox.highlight.processString(unformatted, "javascript");
		doh.assertEqual(unformatted, result.result);
		doh.assertEqual(expected, result.partialResult);
		doh.assertEqual("javascript", result.langName);
	}
	]);
});
require(["dojox/highlight/tests/highlight"]);
