/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/lang/functional/zip"],function(_1,_2,_3){_1.getObject("dojox.lang.tests.misc",1);(function(){var df=_3.lang.functional,_4=df.lambda("100*a + 10*b + c");tests.register("dojox.lang.tests.misc",[function testZip1(t){t.assertEqual(df.zip([1,2,3],[4,5,6]),[[1,4],[2,5],[3,6]]);},function testZip2(t){t.assertEqual(df.zip([1,2],[3,4],[5,6]),[[1,3,5],[2,4,6]]);},function testUnzip1(t){t.assertEqual(df.unzip([[1,4],[2,5],[3,6]]),[[1,2,3],[4,5,6]]);},function testUnzip2(t){t.assertEqual(df.unzip([[1,3,5],[2,4,6]]),[[1,2],[3,4],[5,6]]);},function testMixer(t){t.assertEqual(df.mixer(_4,[1,2,0])(3,1,2),123);},function testFlip(t){t.assertEqual(df.flip(_4)(3,2,1),123);},function testCompose1(t){t.assertEqual(df.lambda(["+5","*3"])(8),8*3+5);},function testCompose2(t){t.assertEqual(df.lambda(["+5","*3"].reverse())(8),(8+5)*3);}]);})();});require(["dojox/lang/tests/misc"]);