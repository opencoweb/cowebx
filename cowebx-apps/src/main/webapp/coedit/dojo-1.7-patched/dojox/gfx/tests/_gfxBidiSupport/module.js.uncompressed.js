/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox"], function(dojo, dijit, dojox){
dojo.getObject("dojox.gfx.tests._gfxBidiSupport.module", 1);
/* builder delete begin
dojo.provide("dojox.gfx.tests._gfxBidiSupport.module");


 builder delete end */
try{
	doh.registerUrl("dojox.gfx.tests._gfxBidiSupport.test_SurfaceGroup", dojo.moduleUrl("dojox", "gfx/tests/_gfxBidiSupport/test_SurfaceGroup.html"));

	if(dojo.isIE){
		doh.registerUrl("dojox.gfx.tests._gfxBidiSupport.silverlight.test_SurfaceGroupSilverlight", dojo.moduleUrl("dojox", "gfx/tests/_gfxBidiSupport/silverlight/test_SurfaceGroupSilverlight.html"));
	}else{
		doh.registerUrl("dojox.gfx.tests._gfxBidiSupport.canvas.test_SurfaceGroupCanvas", dojo.moduleUrl("dojox", "gfx/tests/_gfxBidiSupport/canvas/test_SurfaceGroupCanvas.html"));
	}
	doh.registerUrl("dojox.gfx.tests._gfxBidiSupport.svgWeb.test_SurfaceGroupSvgWeb", dojo.moduleUrl("dojox", "gfx/tests/_gfxBidiSupport/svgWeb/test_SurfaceGroupSvgWeb.html"));

}catch(e){
     doh.debug(e);
}
});
require(["dojox/gfx/tests/_gfxBidiSupport/module"]);
