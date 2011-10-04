/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/lang/functional/object","dojox/lang/oo/mixin","dojox/lang/oo/rearrange"],function(_1,_2,_3){_1.getObject("dojox.lang.tests.oo_mixin",1);(function(){var df=_3.lang.functional,oo=_3.lang.oo,x={a:1,b:2,c:3},y={c:1,d:2,e:3,f:4},z=oo.mixin({},oo.filter(y,{d:"a",e:"b",f:""})),q=_1.clone(x),p=_1.clone(y),_4=function(v,i){this.push("["+i+"] = "+v);},_5=function(o){return df.forIn(o,_4,[]).sort().join(", ");};oo.mixin(q,y);oo.mixin(p,x);oo.rearrange(y,{d:"a",e:"b",f:""});tests.register("dojox.lang.tests.oo_mixin",[function testMixin1(t){t.assertEqual(df.keys(q).sort(),df.keys(p).sort());},function testMixin2(t){t.assertEqual(df.keys(x).sort(),df.keys(z).sort());},function testRearrange(t){t.assertEqual(df.keys(y).sort(),df.keys(z).sort());}]);})();});require(["dojox/lang/tests/oo_mixin"]);