/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo/_base/declare", "./Default"], function(declare, Default){

return dojo.declare("dojox.charting.plot2d.Lines", dojox.charting.plot2d.Default, {
	//	summary:
	//		A convenience constructor to create a typical line chart.
	constructor: function(){
		//	summary:
		//		Preset our default plot to be line-based.
		this.opt.lines = true;
	}
});
});
