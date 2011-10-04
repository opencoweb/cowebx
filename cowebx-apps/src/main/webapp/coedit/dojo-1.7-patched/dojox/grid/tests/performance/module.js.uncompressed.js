/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox"], function(dojo, dijit, dojox){
dojo.getObject("dojox.grid.tests.performance.module", 1);
/* builder delete begin
dojo.provide("dojox.grid.tests.performance.module");


 builder delete end */
doh.register("dojox.grid.tests.performance.module", []);

try{
	var numRows = [100];
	var layouts = ["Single", "Dual"];
	var selectors = [false, true];
	dojo.forEach(numRows, function(r){
		dojo.forEach(layouts, function(l){
			dojo.forEach(selectors, function(s){
				// 5-minute timeout on each of these - since they can take quite a while...
				doh.registerUrl("Grid Creation - " + r + " Rows, " + l + " Layout" + (s ? "w/ selector" : ""),
					dojo.moduleUrl("dojox.grid.tests.performance", "creation.html") +
									"?rows=" + r + "&layout=" + l.toLowerCase() + "&rowSelector=" + s,
					300000);
				doh.registerUrl("Grid dojo.data Notification - " + r + " Rows, " + l + " Layout" + (s ? "w/ selector" : ""),
					dojo.moduleUrl("dojox.grid.tests.performance", "dataNotification.html") +
									"?rows=" + r + "&layout=" + l.toLowerCase() + "&rowSelector=" + s,
					300000);
			});
		});
	});
}catch(e){
	doh.debug(e);
}

});
require(["dojox/grid/tests/performance/module"]);
