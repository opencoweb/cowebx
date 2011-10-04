/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define([".","dojo/_base/kernel", "dojo/_base/sniff"], function(mcompat,dojo, sniff){
	dojo.getObject("mobile.compat", true, dojox);
	if(!sniff.isWebKit){
		require([
			"dojox/mobile/_compat",
			"dojo/fx",
			"dojo/fx/easing"
		]);
	}
	return dojox.mobile.compat;
});
