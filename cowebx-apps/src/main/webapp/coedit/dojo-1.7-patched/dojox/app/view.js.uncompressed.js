/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo", "dijit", "dojox", "dijit/_WidgetBase", "dijit/_Container", "dijit/_Contained","dijit/_TemplatedMixin","dijit/_WidgetsInTemplateMixin"],function(dojo,dijit,dojox,Widget,Container,Contained,TemplatedMixin,WidgetsInTemplateMixin){
	return dojo.declare("dojox.app.view", [Widget,TemplatedMixin,Container,Contained, WidgetsInTemplateMixin], {
		selected: false,
		keepScrollPosition: true,
		baseClass: "applicationView mblView",
		config:null,
		widgetsInTemplate: true,
		templateString: '<div></div>',
		toString: function(){return this.id},
		activate:function(){},
		deactivate: function(){}
	});
});
