/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/mobile/parser","dojox/mobile","dojox/mobile/ScrollableView","dojox/mobile/TextBox","dojox/mvc","dojox/mvc/Generate","dojox/mvc/Group","dojox/mvc/Repeat","dojox/mobile/FlippableView","dojox/mobile/ViewController","dojox/mobile/TextArea","dojox/mobile/Button","dojox/mobile/FixedSplitter","dojox/mobile/EdgeToEdgeList","dojox/mobile/EdgeToEdgeCategory","dojox/mobile/Heading","dojox/mobile/FixedSplitterPane","dojox/mobile/compat","dojo/fx","dojo/fx/easing","dojox/mobile/deviceTheme"], function(dojo, dijit, dojox){
dojo.getObject("dojox.mvc.tests.mobile.demo.src", 1);
/* builder delete begin
dojo.provide("dojox.mvc.tests.mobile.demo.src");


 builder delete end */
//dojo.require("dojo.parser"); // no longer needed for repeat demo
/* builder delete begin
dojo.require("dojox.mobile.parser");

 builder delete end */
/* builder delete begin
dojo.require("dojox.mobile");

 builder delete end */
/* builder delete begin
dojo.require("dojox.mobile.ScrollableView");

 builder delete end */
/* builder delete begin
dojo.require("dojox.mobile.TextBox");

 builder delete end */
/* builder delete begin
dojo.require("dojox.mvc");

 builder delete end */
/* builder delete begin
dojo.require("dojox.mvc.Generate");

 builder delete end */
/* builder delete begin
dojo.require("dojox.mvc.Group");

 builder delete end */
/* builder delete begin
dojo.require("dojox.mvc.Repeat");

 builder delete end */
/* builder delete begin
dojo.require("dojox.mobile.FlippableView");

 builder delete end */
/* builder delete begin
dojo.require("dojox.mobile.ViewController");

 builder delete end */
/* builder delete begin
dojo.require("dojox.mobile.TextArea");

 builder delete end */
/* builder delete begin
dojo.require("dojox.mobile.Button");


 builder delete end */
/* builder delete begin
dojo.require("dojox.mobile.FixedSplitter");

 builder delete end */
/* builder delete begin
dojo.require("dojox.mobile.EdgeToEdgeList");

 builder delete end */
/* builder delete begin
dojo.require("dojox.mobile.EdgeToEdgeCategory");

 builder delete end */
/* builder delete begin
dojo.require("dojox.mobile.Heading");

 builder delete end */
/* builder delete begin
dojo.require("dojox.mobile.FixedSplitterPane");

 builder delete end */
dojo.requireIf(!dojo.isWebKit, "dojox.mobile.compat");
dojo.requireIf(!dojo.isWebKit, "dojo.fx");
dojo.requireIf(!dojo.isWebKit, "dojo.fx.easing");
/* builder delete begin
dojo.require("dojox.mobile.deviceTheme"); 
 builder delete end */
// used for device detection


// Initial data for Ship to - Bill demo
var names = {
	"Serial" : "360324",
	"First"  : "John",
	"Last"   : "Doe",
	"Email"  : "jdoe@us.ibm.com",
	"ShipTo" : {
		"Street" : "123 Valley Rd",
		"City"   : "Katonah",
		"State"  : "NY",
		"Zip"    : "10536"
	},
	"BillTo" : {
		"Street" : "17 Skyline Dr",
		"City"   : "Hawthorne",
		"State"  : "NY",
		"Zip"    : "10532"
	}
};

// Initial repeat data used in the Repeat Data binding demo
var repeatData = [ 
	{
		"First"   : "Chad",
		"Last"    : "Chapman",
		"Location": "CA",
		"Office"  : "1278",
		"Email"   : "c.c@test.com",
		"Tel"     : "408-764-8237",
		"Fax"     : "408-764-8228"
	},
	{
		"First"   : "Irene",
		"Last"    : "Ira",
		"Location": "NJ",
		"Office"  : "F09",
		"Email"   : "i.i@test.com",
		"Tel"     : "514-764-6532",
		"Fax"     : "514-764-7300"
	},
	{
		"First"   : "John",
		"Last"    : "Jacklin",
		"Location": "CA",
		"Office"  : "6701",
		"Email"   : "j.j@test.com",
		"Tel"     : "408-764-1234",
		"Fax"     : "408-764-4321"
	}
];

var selectedIndex = 0;

var model = dojox.mvc.newStatefulModel({ data : names });
var repeatmodel = dojox.mvc.newStatefulModel({ data : repeatData });
var nextIndexToAdd = repeatmodel.data.length;

// used in the Ship to - Bill to demo
function setRef(id, addrRef) {
	var widget = dijit.byId(id);
	widget.set("ref", addrRef);
}

// used in the Repeat Data binding demo
function setDetailsContext(index){
	selectedIndex = index;
	var groupRoot = dijit.byId("detailsGroup");
	groupRoot.set("ref", index);
}

// used in the Repeat Data binding demo
function insertResult(index){
	if (repeatmodel[index-1].First.value !== ""){ // TODO: figure out why we are getting called twice for each click
		var insert = dojox.mvc.newStatefulModel({ "data" : {
			"First"   : "",
			"Last"    : "",
			"Location": "CA",
			"Office"  : "",
			"Email"   : "",
			"Tel"     : "",
			"Fax"     : ""} 
		});
		repeatmodel.add(index, insert);
		setDetailsContext(index);
		nextIndexToAdd++;
	}else{
		setDetailsContext(index-1);                 
	}
};

// used in the Generate View demo
var genmodel;
function updateView() {
	try {
		var modeldata = dojo.fromJson(dojo.byId("modelArea").value);
		genmodel = dojox.mvc.newStatefulModel({ data : modeldata });
		dijit.byId("view").set("ref", genmodel);
		dojo.byId("outerModelArea").style.display = "none";
		dojo.byId("viewArea").style.display = "";              		
	}catch(err){
		console.error("Error parsing json from model: "+err);
	}
};

// used in the Generate View demo
function updateModel() {
	dojo.byId("outerModelArea").style.display = "";
    try {
		dojo.byId("modelArea").focus(); // hack: do this to force focus off of the textbox, bug on mobile?
		dojo.byId("viewArea").style.display = "none";
		dijit.byId("modelArea").set("value",(dojo.toJson(genmodel.toPlainObject(), true)));
	} catch(e) {
		console.log(e);
	};
};

function setup() {
	dojox.mobile.parser.parse();
};

dojo.ready(setup);

});
require(["dojox/mvc/tests/mobile/demo/src"]);
