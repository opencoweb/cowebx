/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["doh","../../crypto/SimpleAES"],function(_1,_2){var _3="The rain in Spain falls mainly on the plain.";var _4="foo-bar-baz";var _5=null;tests.register("dojox.encoding.crypto.tests.SimpleAES",[function testAES(t){var dt=new Date();_5=_2.encrypt(_3,_4);_1.debug("Encrypt: ",new Date()-dt,"ms.");var _6=new Date();t.assertEqual(_3,_2.decrypt(_5,_4));_1.debug("Decrypt: ",new Date()-_6,"ms.");}]);});