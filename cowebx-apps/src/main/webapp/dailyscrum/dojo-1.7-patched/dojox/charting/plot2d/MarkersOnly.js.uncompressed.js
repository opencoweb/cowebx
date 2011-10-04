/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo/_base/declare", "./Default"], function(declare, Default){

return dojo.declare("dojox.charting.plot2d.MarkersOnly", dojox.charting.plot2d.Default, {
	//	summary:
	//		A convenience object to draw only markers (like a scatter but not quite).
	constructor: function(){
		//	summary:
		//		Set up our default plot to only have markers and no lines.
		this.opt.lines   = false;
		this.opt.markers = true;
	}
});
});
