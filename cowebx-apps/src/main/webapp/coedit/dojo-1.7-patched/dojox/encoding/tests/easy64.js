/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["doh","../easy64"],function(_1,_2){var _3="The rain in Spain falls mainly on the plain.";var _4="The rain in Spain falls mainly on the plain.1";var _5="The rain in Spain falls mainly on the plain.ab";var _6="The rain in Spain falls mainly on the plain.!@#";var _7=function(s){var b=[];for(var i=0;i<s.length;++i){b.push(s.charCodeAt(i));}return b;};var _8=function(b){var s=[];dojo.forEach(b,function(c){s.push(String.fromCharCode(c));});return s.join("");};_1.register("dojox.encoding.tests.easy64",[function testEasyMsg1(t){t.assertEqual(_3,_8(_2.decode(_2.encode(_7(_3)))));},function testEasyMsg2(t){t.assertEqual(_4,_8(_2.decode(_2.encode(_7(_4)))));},function testEasyMsg3(t){t.assertEqual(_5,_8(_2.decode(_2.encode(_7(_5)))));},function testEasyMsg4(t){t.assertEqual(_6,_8(_2.decode(_2.encode(_7(_6)))));}]);});