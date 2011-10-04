/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox"], function(dojo, dijit, dojox){
dojo.getObject("dojox.mdnd.tests.robot.module", 1);
/* builder delete begin
dojo.provide("dojox.mdnd.tests.robot.module");


 builder delete end */
try{
	doh.registerUrl("dojox.mdnd.tests.robot.Acceptance",
			dojo.moduleUrl("dojox.mdnd","tests/robot/test_dnd_acceptance.html"),60000);
	doh.registerUrl("dojox.mdnd.tests.robot.VerticalDropMode",
			dojo.moduleUrl("dojox.mdnd","tests/robot/test_dnd_verticalDropMode.html"),60000);
	doh.registerUrl("dojox.mdnd.tests.robot.OverDropMode",
			dojo.moduleUrl("dojox.mdnd","tests/robot/test_dnd_overDropMode.html"),60000);
	doh.registerUrl("dojox.mdnd.tests.robot.DndToDojo",
			dojo.moduleUrl("dojox.mdnd","tests/robot/test_dnd_dndToDojo.html"),60000);
	doh.registerUrl("dojox.mdnd.tests.robot.DndFromDojo",
			dojo.moduleUrl("dojox.mdnd","tests/robot/test_dnd_dndFromDojo.html"),60000);
}catch(e){
	doh.debug(e);
}

});
require(["dojox/mdnd/tests/robot/module"]);
