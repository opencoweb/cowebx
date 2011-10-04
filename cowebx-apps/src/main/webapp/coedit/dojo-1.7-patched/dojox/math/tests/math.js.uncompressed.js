/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/math"], function(dojo, dijit, dojox){
dojo.getObject("dojox.math.tests.math", 1);
/* builder delete begin
dojo.provide("dojox.math.tests.math");


 builder delete end */
/* builder delete begin
dojo.require("dojox.math");


 builder delete end */
(function(){
	function approx(r){
		return Math.floor(r * (1 << 30)) / (1 << 30);
	}
	tests.register("dojox.math.tests.factorial", [
		// standard integer values
		function fact0(t){ t.assertEqual(1, dojox.math.factorial(0)); },
		function fact1(t){ t.assertEqual(1, dojox.math.factorial(1)); },
		function fact2(t){ t.assertEqual(2, dojox.math.factorial(2)); },
		function fact5(t){ t.assertEqual(120, dojox.math.factorial(5)); },
		// almost integer
		function fact5minus(t){ t.assertEqual(approx(119.999804750496600), approx(dojox.math.factorial(5-1/1048576))); },
		function fact5plus(t){ t.assertEqual(approx(120.000195249840876), approx(dojox.math.factorial(5+1/1048576))); },
		// geometric values
		function factNeg1half(t){ t.assertEqual(Math.sqrt(Math.PI), dojox.math.factorial(-0.5)); },
		function factPos1half(t){ t.assertEqual(approx(Math.sqrt(Math.PI)/2), approx(dojox.math.factorial(0.5))); },
		function factNeg3halves(t){ t.assertEqual(approx(-Math.sqrt(Math.PI)*2), approx(dojox.math.factorial(-1.5))); },
		function factNeg5halves(t){ t.assertEqual(approx(Math.sqrt(Math.PI)*4/3), approx(dojox.math.factorial(-2.5))); },
		function factPos5halves(t){ t.assertEqual(approx(Math.sqrt(Math.PI)*15/8), approx(dojox.math.factorial(2.5))); },
		// invalid values
		function factNeg1(t){ t.assertEqual(NaN, dojox.math.factorial(-1)); },
		function factNeg2(t){ t.assertEqual(NaN, dojox.math.factorial(-2)); }
	]);
	
})();

});
require(["dojox/math/tests/math"]);
