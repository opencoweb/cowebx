/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo/_base/declare", "./Stacked"], 
	function(declare, Stacked){

return dojo.declare("dojox.charting.plot2d.StackedLines", dojox.charting.plot2d.Stacked, {
	//	summary:
	//		A convenience object to create a stacked line chart.
	constructor: function(){
		//	summary:
		//		Force our Stacked base to be lines only.
		this.opt.lines = true;
	}
});
});
