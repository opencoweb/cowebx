/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["doh","../../compression/lzw","../../bits"],function(_1,_2,_3){var _4="The rain in Spain falls mainly on the plain.";var _5="The rain in Spain falls mainly on the plain.1";var _6="The rain in Spain falls mainly on the plain.ab";var _7="The rain in Spain falls mainly on the plain.!@#";var _8=function(s){var b=[];for(var i=0;i<s.length;++i){b.push(s.charCodeAt(i));}return b;};var _9=function(b){var s=[];dojo.forEach(b,function(c){s.push(String.fromCharCode(c));});return s.join("");};var _a=function(_b){var x=new _3.OutputStream(),_c=new _2.Encoder(128);dojo.forEach(_8(_b),function(v){_c.encode(v,x);});_c.flush(x);return x.getBuffer();};var _d=function(n,_e){var x=new _3.InputStream(_e,_e.length*8),_f=new _2.Decoder(128),t=[],w=0;while(w<n){var v=_f.decode(x);t.push(v);w+=v.length;}return t.join("");};_1.register("dojox.encoding.tests.compression.lzw",[function testLzwMsg1(t){t.assertEqual(_4,_d(_4.length,_a(_4)));},function testLzwMsg2(t){t.assertEqual(_5,_d(_5.length,_a(_5)));},function testLzwMsg3(t){t.assertEqual(_6,_d(_6.length,_a(_6)));},function testLzwMsg4(t){t.assertEqual(_7,_d(_7.length,_a(_7)));}]);});