/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/data/tests/ClientFilter","dojox/data/tests/stores/CsvStore","dojox/data/tests/stores/KeyValueStore","dojox/data/tests/stores/AndOrReadStore","dojox/data/tests/stores/AndOrWriteStore","dojox/data/tests/stores/QueryReadStore","dojox/data/tests/stores/SnapLogicStore","dojox/data/tests/stores/FileStore"], function(dojo, dijit, dojox){
dojo.getObject("dojox.data.tests.module", 1);
/* builder delete begin
dojo.provide("dojox.data.tests.module");


 builder delete end */
try{
	/* builder delete begin
dojo.require("dojox.data.tests.ClientFilter");
	
 builder delete end */
/* builder delete begin
dojo.require("dojox.data.tests.stores.CsvStore");
	
 builder delete end */
/* builder delete begin
dojo.require("dojox.data.tests.stores.KeyValueStore");
	
 builder delete end */
/* builder delete begin
dojo.require("dojox.data.tests.stores.AndOrReadStore");
	
 builder delete end */
/* builder delete begin
dojo.require("dojox.data.tests.stores.AndOrWriteStore");
	
 builder delete end */
dojo.requireIf(dojo.isBrowser, "dojox.data.tests.stores.HtmlTableStore");
	dojo.requireIf(dojo.isBrowser, "dojox.data.tests.stores.HtmlStore");
	dojo.requireIf(dojo.isBrowser, "dojox.data.tests.stores.OpmlStore");
	dojo.requireIf(dojo.isBrowser, "dojox.data.tests.stores.XmlStore");
	dojo.requireIf(dojo.isBrowser, "dojox.data.tests.stores.FlickrStore");
	dojo.requireIf(dojo.isBrowser, "dojox.data.tests.stores.FlickrRestStore");
	dojo.requireIf(dojo.isBrowser, "dojox.data.tests.stores.PicasaStore");
	dojo.requireIf(dojo.isBrowser, "dojox.data.tests.stores.AtomReadStore");
	dojo.requireIf(dojo.isBrowser, "dojox.data.tests.stores.GoogleSearchStore");
	dojo.requireIf(dojo.isBrowser, "dojox.data.tests.stores.GoogleFeedStore");
	dojo.requireIf(dojo.isBrowser, "dojox.data.tests.stores.WikipediaStore");

	//Load only if in a browser AND if the location is remote (not file.  As it needs a PHP server to work).
	if(dojo.isBrowser){
		if(window.location.protocol !== "file:"){
			/* builder delete begin
dojo.require("dojox.data.tests.stores.QueryReadStore");
			
 builder delete end */
/* builder delete begin
dojo.require("dojox.data.tests.stores.SnapLogicStore");
			
 builder delete end */
/* builder delete begin
dojo.require("dojox.data.tests.stores.FileStore");
		
 builder delete end */
}
	}
	dojo.requireIf(dojo.isBrowser, "dojox.data.tests.stores.CssRuleStore");
	dojo.requireIf(dojo.isBrowser, "dojox.data.tests.stores.CssClassStore");
	dojo.requireIf(dojo.isBrowser, "dojox.data.tests.stores.AppStore");
	dojo.requireIf(dojo.isBrowser, "dojox.data.tests.stores.OpenSearchStore");
	dojo.requireIf(dojo.isBrowser, "dojox.data.tests.dom");
}catch(e){
	doh.debug(e);
}




});
require(["dojox/data/tests/module"]);
