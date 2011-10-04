/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/math/random/Simple","dojox/math/random/Secure","dojox/math/random/prng4"], function(dojo, dijit, dojox){
dojo.getObject("dojox.math.tests.random", 1);
/* builder delete begin
dojo.provide("dojox.math.tests.random");


 builder delete end */
/* builder delete begin
dojo.require("dojox.math.random.Simple");

 builder delete end */
/* builder delete begin
dojo.require("dojox.math.random.Secure");

 builder delete end */
/* builder delete begin
dojo.require("dojox.math.random.prng4");


 builder delete end */
tests.register("dojox.math.tests.random",
	[
		function sanity_check_Simple(t){
			var r = new dojox.math.random.Simple(),
				a = new Array(256);
			r.nextBytes(a);
			t.f(dojo.every(a, function(x){ return x === a[0]; }));
			r.destroy();
		},
		function sanity_check_Secure(t){
			var r = new dojox.math.random.Secure(dojox.math.random.prng4),
				a = new Array(256);
			r.nextBytes(a);
			t.f(dojo.every(a, function(x){ return x === a[0]; }));
			r.destroy();
		}
	]
);

});
require(["dojox/math/tests/random"]);
