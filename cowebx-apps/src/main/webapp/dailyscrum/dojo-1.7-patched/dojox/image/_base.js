/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox"],function(_1,_2,_3){_1.getObject("dojox.image._base",1);(function(d){var _4;_3.image.preload=function(_5){if(!_4){_4=d.create("div",{style:{position:"absolute",top:"-9999px",height:"1px",overflow:"hidden"}},d.body());}return d.map(_5,function(_6){return d.create("img",{src:_6},_4);});};if(d.config.preloadImages){d.addOnLoad(function(){_3.image.preload(d.config.preloadImages);});}})(_1);});require(["dojox/image/_base"]);