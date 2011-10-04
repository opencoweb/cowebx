/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/math/random/Simple","dojox/math/random/Secure","dojox/math/random/prng4"],function(_1,_2,_3){_1.getObject("dojox.math.tests.random",1);tests.register("dojox.math.tests.random",[function sanity_check_Simple(t){var r=new _3.math.random.Simple(),a=new Array(256);r.nextBytes(a);t.f(_1.every(a,function(x){return x===a[0];}));r.destroy();},function sanity_check_Secure(t){var r=new _3.math.random.Secure(_3.math.random.prng4),a=new Array(256);r.nextBytes(a);t.f(_1.every(a,function(x){return x===a[0];}));r.destroy();}]);});require(["dojox/math/tests/random"]);