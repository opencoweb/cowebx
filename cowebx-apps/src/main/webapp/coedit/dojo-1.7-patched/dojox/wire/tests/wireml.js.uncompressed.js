/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox"], function(dojo, dijit, dojox){
dojo.getObject("dojox.wire.tests.wireml", 1);
/* builder delete begin
dojo.provide("dojox.wire.tests.wireml");


 builder delete end */
try{
	if(dojo.isBrowser){
		doh.registerUrl("dojox.wire.tests.ml.Action", dojo.moduleUrl("dojox", "wire/tests/markup/Action.html"));
		doh.registerUrl("dojox.wire.tests.ml.Transfer", dojo.moduleUrl("dojox", "wire/tests/markup/Transfer.html"));
		doh.registerUrl("dojox.wire.tests.ml.Invocation", dojo.moduleUrl("dojox", "wire/tests/markup/Invocation.html"));
		doh.registerUrl("dojox.wire.tests.ml.Data", dojo.moduleUrl("dojox", "wire/tests/markup/Data.html"));
		doh.registerUrl("dojox.wire.tests.ml.DataStore", dojo.moduleUrl("dojox", "wire/tests/markup/DataStore.html"));
		doh.registerUrl("dojox.wire.tests.ml.Service", dojo.moduleUrl("dojox", "wire/tests/markup/Service.html"));
	}
}catch(e){
	doh.debug(e);
}

});
require(["dojox/wire/tests/wireml"]);
