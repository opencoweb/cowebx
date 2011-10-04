/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo/_base/declare"], function(declare) {

return dojo.declare("dojox.charting.plot3d.Base", null, {
	constructor: function(width, height, kwArgs){
		this.width  = width;
		this.height = height;
	},
	setData: function(data){
		this.data = data ? data : [];
		return this;
	},
	getDepth: function(){
		return this.depth;
	},
	generate: function(chart, creator){
	}
});
});

