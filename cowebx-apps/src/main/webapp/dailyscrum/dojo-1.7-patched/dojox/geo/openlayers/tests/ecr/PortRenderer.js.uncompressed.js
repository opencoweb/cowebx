/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

//dojo.provide allows pages to use all of the types declared in this resource.
//dojo.provide("dojox.geo.openlayers.tests.ecr.PortRenderer");
//dojo.require("dojox.geo.openlayers.Point");

//dojo.require("dojox.geo.openlayers.tests.ecr.EcrRenderer");
//dojo.require("dojox.geo.openlayers.GeometryFeature");
//dojo.require("dojox.geo.openlayers.Geometry");

define(["dojo/_base/kernel",  "dojo/_base/declare", "dojox/geo/openlayers/tests/ecr/EcrRenderer", "dojox/geo/openlayers/GeometryFeature",
		"dojox/geo/openlayers/Point"], function(dojo, declare){

	return dojo.declare("dojox.geo.openlayers.tests.ecr.PortRenderer",
			[ dojox.geo.openlayers.tests.ecr.EcrRenderer ], {

				constructor : function(opts, context){},

				_renderItem : function(o, item){
					var gf = null;
					if (o.type == "circle") {
						var coords = this.getCoordinates(item);
						var g = new dojox.geo.openlayers.Point({
							x : coords[0],
							y : coords[1]
						});
						gf = new dojox.geo.openlayers.GeometryFeature(g);
						gf.setShapeProperties({
							r : o.radius
						});
					}
					return gf;
				}
			});
});
