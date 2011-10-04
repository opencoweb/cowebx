/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/lang/functional","dojox/lang/functional/sequence"], function(dojo, dijit, dojox){
dojo.getObject("dojox.lang.tests.lambda", 1);
?/* builder delete begin
dojo.provide("dojox.lang.tests.lambda");


 builder delete end */
/* builder delete begin
dojo.require("dojox.lang.functional");

 builder delete end */
/* builder delete begin
dojo.require("dojox.lang.functional.sequence");


 builder delete end */
(function(){
	var df = dojox.lang.functional;
	tests.register("dojox.lang.tests.lambda", [
		function testLambda1(t){ t.assertEqual(df.repeat(3, "3*", 1), [1, 3, 9]); },
		function testLambda2(t){ t.assertEqual(df.repeat(3, "*3", 1), [1, 3, 9]); },
		function testLambda3(t){ t.assertEqual(df.repeat(3, "_*3", 1), [1, 3, 9]); },
		function testLambda4(t){ t.assertEqual(df.repeat(3, "3*_", 1), [1, 3, 9]); },
		function testLambda5(t){ t.assertEqual(df.repeat(3, "n->n*3", 1), [1, 3, 9]); },
		function testLambda6(t){ t.assertEqual(df.repeat(3, "n*3", 1), [1, 3, 9]); },
		function testLambda7(t){ t.assertEqual(df.repeat(3, "3*m", 1), [1, 3, 9]); },
		function testLambda8(t){ t.assertEqual(df.repeat(3, "->1", 1), [1, 1, 1]); },
		function testLambda9(t){ t.assertEqual(df.repeat(3, function(n){ return n * 3; }, 1), [1, 3, 9]); },
		function testLambda10(t){ t.assertEqual(df.repeat(3, ["_-1", ["*3"]], 1), [1, 2, 5]); }
	]);
})();

});
require(["dojox/lang/tests/lambda"]);
