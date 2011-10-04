/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo/_base/array","./_base"],function(_1,_2){_2.Stack=function(_3){var q=[];if(_3){q=q.concat(_3);}this.count=q.length;this.clear=function(){q=[];this.count=q.length;};this.clone=function(){return new _2.Stack(q);};this.contains=function(o){for(var i=0;i<q.length;i++){if(q[i]==o){return true;}}return false;};this.copyTo=function(_4,i){_4.splice(i,0,q);};this.forEach=function(fn,_5){_1.forEach(q,fn,_5);};this.getIterator=function(){return new _2.Iterator(q);};this.peek=function(){return q[(q.length-1)];};this.pop=function(){var r=q.pop();this.count=q.length;return r;};this.push=function(o){this.count=q.push(o);};this.toArray=function(){return [].concat(q);};};return _2.Stack;});