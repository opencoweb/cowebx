/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox"],function(_1,_2,_3){_1.getObject("dojox.grid.tests.performance.module",1);doh.register("dojox.grid.tests.performance.module",[]);try{var _4=[100];var _5=["Single","Dual"];var _6=[false,true];_1.forEach(_4,function(r){_1.forEach(_5,function(l){_1.forEach(_6,function(s){doh.registerUrl("Grid Creation - "+r+" Rows, "+l+" Layout"+(s?"w/ selector":""),_1.moduleUrl("dojox.grid.tests.performance","creation.html")+"?rows="+r+"&layout="+l.toLowerCase()+"&rowSelector="+s,300000);doh.registerUrl("Grid dojo.data Notification - "+r+" Rows, "+l+" Layout"+(s?"w/ selector":""),_1.moduleUrl("dojox.grid.tests.performance","dataNotification.html")+"?rows="+r+"&layout="+l.toLowerCase()+"&rowSelector="+s,300000);});});});}catch(e){doh.debug(e);}});require(["dojox/grid/tests/performance/module"]);