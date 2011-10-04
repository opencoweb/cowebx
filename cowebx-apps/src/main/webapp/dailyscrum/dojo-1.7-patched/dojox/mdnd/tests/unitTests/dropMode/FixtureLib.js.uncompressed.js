/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox"], function(dojo, dijit, dojox){
dojo.getObject("dojox.mdnd.tests.unitTests.dropMode.FixtureLib", 1);
/* builder delete begin
dojo.provide("dojox.mdnd.tests.unitTests.dropMode.FixtureLib");


 builder delete end */
dojo.declare("getDragPointFixture", null, {

	constructor:function(testName, test) {
		this.name = testName;
		this.runTest = test;
	},

	setUp:function() {
		this.coords = {'x':25,'y':50};
		this.size = {'w':100,'h':100};
		this.mousePosition = {'x':50, 'y':75};
		this.dropMode = dojox.mdnd.areaManager()._dropMode;
	},

	tearDown:function() {
		delete this.coords;
		delete this.size;
		delete this.dropMode;
	}
});

		
dojo.declare("AreaFixture", null, {

	constructor:function(testName, test) {
		this.name = testName;
		this.runTest = test;
	},

	setUp:function() {
		this.dropMode = dojox.mdnd.areaManager()._dropMode;
		this.array = [];
		
		//fake area object
		this.objectA = {'node': dojo.byId('areaA')};
		this.objectB = {'node': dojo.byId('areaB')};
		this.objectC = {'node': dojo.byId('areaC')};
		this.objectD = {'node': dojo.byId('areaD')};
	},

	tearDown:function() {
		delete this.dropMode;
		delete this.array;
		delete this.objectA;
		delete this.objectB;
		delete this.objectC;
		delete this.objectD;
	}
});

dojo.declare("ItemFixture", null, {

	constructor:function(testName, test) {
		this.name = testName;
		this.runTest = test;
	},
						
	setUp:function() {
		this.dropMode = dojox.mdnd.areaManager()._dropMode;
		this.objet = {};
		// fake moveable object
		this.moveableA = {'node': dojo.byId("itemA")};
		this.moveableB = {'node': dojo.byId("itemB")};
		this.moveableC = {'node': dojo.byId("itemC")};
		this.moveableD = {'node': dojo.byId("itemD")};
		// fake item object
		this.itemA = {'item': this.moveableA};
		this.itemB = {'item': this.moveableB};
		this.itemC = {'item': this.moveableC};
		this.itemD = {'item': this.moveableD};
	},
	
	tearDown: function(){
		delete this.dropMode;
		delete this.array;
		delete this.moveableA;
		delete this.moveableB;
		delete this.moveableC;
		delete this.moveableD;
		delete this.itemA;
		delete this.itemB;
		delete this.itemC;
		delete this.itemD;
	}
});

});
require(["dojox/mdnd/tests/unitTests/dropMode/FixtureLib"]);
