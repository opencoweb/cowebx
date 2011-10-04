/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojo/io/script","dojox/rpc/Service"], function(dojo, dijit, dojox){
dojo.getObject("dojox.rpc.tests.Wikipedia", 1);
/* builder delete begin
dojo.provide("dojox.rpc.tests.Wikipedia");

 builder delete end */
/* builder delete begin
dojo.require("dojo.io.script");

 builder delete end */
/* builder delete begin
dojo.require("dojox.rpc.Service");


 builder delete end */
dojox.rpc.tests.wikipediaService = new dojox.rpc.Service(dojo.moduleUrl("dojox.rpc.SMDLibrary", "wikipedia.smd"));

dojox.rpc.tests.wikipediaService.TEST_METHOD_TIMEOUT = 8000;

dojox.rpc.tests.wikipediaService._query = function(q){
	return function(m){
		var d = new doh.Deferred();

		if (q.parameters && q.parameters.action && q.expectedResult) {
			var wp = dojox.rpc.tests.wikipediaService.query(q.parameters);
			wp.addCallback(this, function(result){
				console.log(result);
				if (result[q.expectedResult]){
					d.callback(true);
				}else{
					d.errback(new Error("Unexpected Return Value: ", result));
				}
			});
		}

		return d;
	}
};

doh.register("dojox.rpc.tests.wikipedia",
	[
		{
			name: "#1, Wikipedia::parse",
			timeout: dojox.rpc.tests.wikipediaService.TEST_METHOD_TIMEOUT,
			runTest: dojox.rpc.tests.wikipediaService._query({
				parameters: {
					action: "parse",
					page: "Dojo Toolkit"
				},
				expectedResult: "parse"
			})
		},
		{
			name: "#2, Wikipedia::search",
			timeout: dojox.rpc.tests.wikipediaService.TEST_METHOD_TIMEOUT,
			runTest: dojox.rpc.tests.wikipediaService._query({
				parameters: {
					action: "query",
					list: "search",
					srwhat: "text",
					srsearch: "Dojo Toolkit"
				},
				expectedResult: "query"
			})
		}
]);

});
require(["dojox/rpc/tests/Wikipedia"]);
