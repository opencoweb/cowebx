/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/highlight","dojox/highlight/languages/_all"],function(_1,_2,_3){_1.getObject("dojox.highlight.tests.highlight",1);doh.register("dojox.highlight.tests.highlight",[function test_validjavascript(){var _4="console.debug('hello'); /*Hi*/";var _5="console.debug(<span class=\"string\">'hello'</span>); <span class=\"comment\">/*Hi*/</span>";var _6=_3.highlight.processString(_4,"javascript");doh.assertEqual(_5,_6.result);doh.assertTrue(!_6.partialResult);doh.assertEqual("javascript",_6.langName);},function test_invalidjavascript(){var _7="console.debug('hello);\n /*Hi*/";var _8="console.debug(<span class=\"string\">";var _9=_3.highlight.processString(_7,"javascript");doh.assertEqual(_7,_9.result);doh.assertEqual(_8,_9.partialResult);doh.assertEqual("javascript",_9.langName);}]);});require(["dojox/highlight/tests/highlight"]);