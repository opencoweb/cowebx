/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox"], function(dojo, dijit, dojox){
dojo.getObject("dojox.gfx.tests.performance.module", 1);
/* builder delete begin
dojo.provide("dojox.gfx.tests.performance.module");

 builder delete end */
if(dojo.isBrowser){
	doh.registerUrl("GFX: Primitives", dojo.moduleUrl("dojox", "gfx/tests/performance/gfx_primitives.html"), 3600000);
	doh.registerUrl("GFX: Fill", dojo.moduleUrl("dojox", "gfx/tests/performance/gfx_fill.html"), 3600000);
	doh.registerUrl("GFX: Complex Scenes", dojo.moduleUrl("dojox", "gfx/tests/performance/gfx_scenes.html"), 3600000);
}



});
require(["dojox/gfx/tests/performance/module"]);
