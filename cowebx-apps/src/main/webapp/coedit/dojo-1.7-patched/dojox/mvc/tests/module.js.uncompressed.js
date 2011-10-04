/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox"], function(dojo, dijit, dojox){
dojo.getObject("dojox.mvc.tests.module", 1);
/* builder delete begin
dojo.provide("dojox.mvc.tests.module");


 builder delete end */
try{
	var userArgs = window.location.search.replace(/[\?&](dojoUrl|testUrl|testModule)=[^&]*/g,"").replace(/^&/,"?");
	// DOH
	doh.registerUrl("dojox.mvc.tests.doh_mvc_shipto-billto-simple", dojo.moduleUrl("dojox.mvc","tests/doh_mvc_shipto-billto-simple.html"+userArgs), 999999);
	doh.registerUrl("dojox.mvc.tests.doh_mvc_search-results-repeat", dojo.moduleUrl("dojox.mvc","tests/doh_mvc_search-results-repeat.html"+userArgs), 999999);
	doh.registerUrl("dojox.mvc.tests.doh_mvc_search-results-repeat-store", dojo.moduleUrl("dojox.mvc","tests/doh_mvc_search-results-repeat-store.html"+userArgs), 999999);
	doh.registerUrl("dojox.mvc.tests.doh_mvc_binding-simple", dojo.moduleUrl("dojox.mvc","tests/doh_mvc_binding-simple.html"+userArgs), 999999);
	// Robot
	doh.registerUrl("dojox.mvc.tests.robot.mvc_shipto-billto-simple", dojo.moduleUrl("dojox.mvc","tests/robot/mvc_shipto-billto-simple.html"+userArgs), 999999);
	doh.registerUrl("dojox.mvc.tests.robot.mvc_generate-view", dojo.moduleUrl("dojox.mvc","tests/robot/mvc_generate-view.html"+userArgs), 999999);
	doh.registerUrl("dojox.mvc.tests.robot.mvc_loan-stateful", dojo.moduleUrl("dojox.mvc","tests/robot/mvc_loan-stateful.html"+userArgs), 999999);
	doh.registerUrl("dojox.mvc.tests.robot.mvc_ref-set-repeat", dojo.moduleUrl("dojox.mvc","tests/robot/mvc_ref-set-repeat.html"+userArgs), 999999);
	//doh.registerUrl("dojox.mvc.tests.robot.mvc_search-results-repeat", dojo.moduleUrl("dojox.mvc","tests/robot/mvc_search-results-repeat.html"+userArgs), 999999);
	doh.registerUrl("dojox.mvc.tests.robot.mobile-demo-test", dojo.moduleUrl("dojox.mvc","tests/robot/mobile-demo-test.html"+userArgs), 999999);
	doh.registerUrl("dojox.mvc.tests.robot.mvc_search-results-ins-del", dojo.moduleUrl("dojox.mvc","tests/robot/mvc_search-results-ins-del.html"+userArgs), 999999);
	//doh.registerUrl("dojox.mvc.tests.robot.iphone_shipto-billto", dojo.moduleUrl("dojox.mvc","tests/robot/iphone_shipto-billto.html"+userArgs), 999999);
	//doh.registerUrl("dojox.mvc.tests.robot.android_repeat-ins", dojo.moduleUrl("dojox.mvc","tests/robot/android_repeat-ins.html"+userArgs), 999999);
	doh.registerUrl("dojox.mvc.tests.robot.mvc_shipto-billto-hierarchical", dojo.moduleUrl("dojox.mvc","tests/robot/mvc_shipto-billto-hierarchical.html"+userArgs), 999999);
}catch(e){
	doh.debug(e);
}

});
require(["dojox/mvc/tests/module"]);
