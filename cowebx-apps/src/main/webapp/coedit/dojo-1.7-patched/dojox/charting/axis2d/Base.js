/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo/_base/declare","../Element"],function(_1,_2){return dojo.declare("dojox.charting.axis2d.Base",dojox.charting.Element,{constructor:function(_3,_4){this.vertical=_4&&_4.vertical;},clear:function(){return this;},initialized:function(){return false;},calculate:function(_5,_6,_7){return this;},getScaler:function(){return null;},getTicks:function(){return null;},getOffsets:function(){return {l:0,r:0,t:0,b:0};},render:function(_8,_9){this.dirty=false;return this;}});});