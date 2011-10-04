/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo/_base/array"],function(_1){_1.getObject("collections",true,dojox);dojox.collections.DictionaryEntry=function(k,v){this.key=k;this.value=v;this.valueOf=function(){return this.value;};this.toString=function(){return String(this.value);};};dojox.collections.Iterator=function(_2){var a=_2;var _3=0;this.element=a[_3]||null;this.atEnd=function(){return (_3>=a.length);};this.get=function(){if(this.atEnd()){return null;}this.element=a[_3++];return this.element;};this.map=function(fn,_4){return _1.map(a,fn,_4);};this.reset=function(){_3=0;this.element=a[_3];};};dojox.collections.DictionaryIterator=function(_5){var a=[];var _6={};for(var p in _5){if(!_6[p]){a.push(_5[p]);}}var _7=0;this.element=a[_7]||null;this.atEnd=function(){return (_7>=a.length);};this.get=function(){if(this.atEnd()){return null;}this.element=a[_7++];return this.element;};this.map=function(fn,_8){return _1.map(a,fn,_8);};this.reset=function(){_7=0;this.element=a[_7];};};return dojox.collections;});