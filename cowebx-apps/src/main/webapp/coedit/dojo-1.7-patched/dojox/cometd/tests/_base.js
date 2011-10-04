/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/cometd"],function(_1,_2,_3){_1.getObject("dojox.cometd.tests._base",1);tests.register("dojox.cometd.tests._base",[function basicSyntaxCheck(t){t.assertTrue(true);},function basicInitCheck(t){var d=_3.cometd.init("http://www.sitepen.com:9000/cometd");if(d){t.assertTrue(true);}},function basicSubscribeCheck(t){_3.cometd.subscribe("/basic/unit/test",function(e){});t.assertTrue(true);},function basicPublishCheck(t){_3.cometd.publish("/basic/unit/test",[{message:"unit test"}]);t.assertTrue(true);}]);});require(["dojox/cometd/tests/_base"]);