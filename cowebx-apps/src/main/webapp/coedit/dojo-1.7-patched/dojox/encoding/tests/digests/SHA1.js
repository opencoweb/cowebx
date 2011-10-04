/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["doh","../../digests/_base","../../digests/SHA1"],function(_1,_2,_3){var _4="abc";var _5="qZk+NkcGgWq6PiVxeFDCbJzQ2J0=";var _6="a9993e364706816aba3e25717850c26c9cd0d89d";var s="??>6G?j?>%qxP?l????";_1.register("dojox.encoding.tests.digests.SHA1",[function testBase64Compute(t){t.assertEqual(_5,_3(_4));},function testHexCompute(t){t.assertEqual(_6,_3(_4,_2.outputTypes.Hex));},function testStringCompute(t){t.assertEqual(s,_3(_4,_2.outputTypes.String));}]);});