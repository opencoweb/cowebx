/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dijit/_Templated","dijit/_Widget","dojox/data/demos/widgets/PicasaView"],function(_1,_2,_3){_1.getObject("dojox.data.demos.widgets.PicasaViewList",1);_1.declare("dojox.data.demos.widgets.PicasaViewList",[_2._Widget,_2._Templated],{templateString:_1.cache("dojox","data/demos/widgets/templates/PicasaViewList.html"),listNode:null,postCreate:function(){this.fViewWidgets=[];},clearList:function(){while(this.list.firstChild){this.list.removeChild(this.list.firstChild);}for(var i=0;i<this.fViewWidgets.length;i++){this.fViewWidgets[i].destroy();}this.fViewWidgets=[];},addView:function(_4){var _5=new _3.data.demos.widgets.PicasaView(_4);this.fViewWidgets.push(_5);this.list.appendChild(_5.domNode);}});});require(["dojox/data/demos/widgets/PicasaViewList"]);