/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox"], function(dojo, dijit, dojox){
dojo.getObject("dojox.mdnd.tests.unitTests.dropMode.module", 1);
/* builder delete begin
dojo.provide('dojox.mdnd.tests.unitTests.dropMode.module');


 builder delete end */
try{
	doh.registerUrl("dojox.mdnd.tests.unitTests.dropMode.VerticalDropModeTest",
			dojo.moduleUrl("dojox.mdnd","tests/unitTests/dropMode/VerticalDropModeTest.html"), 60000);
	doh.registerUrl("dojox.mdnd.tests.unitTests.dropMode.OverDropModeTest",
			dojo.moduleUrl("dojox.mdnd","tests/unitTests/dropMode/OverDropModeTest.html"), 60000);
}catch(e){
	doh.debug(e);
}

});
require(["dojox/mdnd/tests/unitTests/dropMode/module"]);
