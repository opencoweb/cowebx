/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["doh","../../digests/_base","../../digests/MD5"],function(_1,_2,_3){var _4="The rain in Spain falls mainly on the plain.";var _5="OUhxbVZ1Mtmu4zx9LzS5cA==";var _6="3948716d567532d9aee33c7d2f34b970";var s="9HqmVu2???<}/4?p";_1.register("dojox.encoding.tests.digests.MD5",[function testBase64Compute(t){t.assertEqual(_5,_3(_4));},function testHexCompute(t){t.assertEqual(_6,_3(_4,_2.outputTypes.Hex));},function testStringCompute(t){t.assertEqual(s,_3(_4,_2.outputTypes.String));}]);});