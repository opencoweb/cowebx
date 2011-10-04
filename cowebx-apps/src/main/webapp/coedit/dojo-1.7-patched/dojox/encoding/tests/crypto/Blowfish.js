/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["doh","../../crypto/Blowfish"],function(_1,_2){var _3="The rain in Spain falls mainly on the plain.";var _4="foobar";var _5="WI5J5BPPVBuiTniVcl7KlIyNMmCosmKTU6a/ueyQuoUXyC5dERzwwdzfFsiU4vBw";tests.register("dojox.encoding.crypto.tests.Blowfish",[function testEncrypt(t){var dt=new Date();t.assertEqual(_5,_2.encrypt(_3,_4));_1.debug("testEncrypt: ",new Date()-dt,"ms.");},function testDecrypt(t){var dt=new Date();t.assertEqual(_3,_2.decrypt(_5,_4));_1.debug("testDecrypt: ",new Date()-dt,"ms.");},function testShortMessage(t){var _6="pass";var _7="foobar";var dt=new Date();var _8=_2.encrypt(_6,_7);var _9=_2.decrypt(_8,_7);t.assertEqual(_9,_6);_1.debug("testShortMessage: ",new Date()-dt,"ms.");}]);});