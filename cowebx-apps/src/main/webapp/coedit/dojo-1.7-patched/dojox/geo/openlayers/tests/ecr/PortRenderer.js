/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo/_base/kernel","dojo/_base/declare","dojox/geo/openlayers/tests/ecr/EcrRenderer","dojox/geo/openlayers/GeometryFeature","dojox/geo/openlayers/Point"],function(_1,_2){return _1.declare("dojox.geo.openlayers.tests.ecr.PortRenderer",[dojox.geo.openlayers.tests.ecr.EcrRenderer],{constructor:function(_3,_4){},_renderItem:function(o,_5){var gf=null;if(o.type=="circle"){var _6=this.getCoordinates(_5);var g=new dojox.geo.openlayers.Point({x:_6[0],y:_6[1]});gf=new dojox.geo.openlayers.GeometryFeature(g);gf.setShapeProperties({r:o.radius});}return gf;}});});