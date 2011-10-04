/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["./gfx/_base", "./gfx/renderer!"], function(base, renderer){
	var gfx = dojo.getObject("gfx", true, dojox);
	gfx.switchTo(renderer);
	return gfx;
});
