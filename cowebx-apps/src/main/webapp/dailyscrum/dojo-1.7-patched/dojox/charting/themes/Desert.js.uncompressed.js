/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["../Theme", "./common"], function(Theme){

	//	notes: colors generated by moving in 30 degree increments around the hue circle,
	//		at 90% saturation, using a B value of 75 (HSB model).
	dojox.charting.themes.Desert=new Theme({
		colors: [
			"#ffebd5",
			"#806544",
			"#fdc888",
			"#80766b",
			"#cda26e"
		]
	});
	
	return dojox.charting.themes.Desert;
});
