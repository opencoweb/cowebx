/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox"], function(dojo, dijit, dojox){
dojo.getObject("dojox.wire.tests.programmatic.ConverterDynamic", 1);
/* builder delete begin
dojo.provide("dojox.wire.tests.programmatic.ConverterDynamic");


 builder delete end */
dojo.declare("dojox.wire.tests.programmatic.ConverterDynamic", null, {
	convert: function(v){
		return v + 1;
	}
});


});
require(["dojox/wire/tests/programmatic/ConverterDynamic"]);
