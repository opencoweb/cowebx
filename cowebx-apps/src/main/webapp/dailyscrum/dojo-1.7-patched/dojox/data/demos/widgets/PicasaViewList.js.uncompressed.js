/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dijit/_Templated","dijit/_Widget","dojox/data/demos/widgets/PicasaView"], function(dojo, dijit, dojox){
dojo.getObject("dojox.data.demos.widgets.PicasaViewList", 1);
/* builder delete begin
dojo.provide("dojox.data.demos.widgets.PicasaViewList");

 builder delete end */
/* builder delete begin
dojo.require("dijit._Templated");

 builder delete end */
/* builder delete begin
dojo.require("dijit._Widget");

 builder delete end */
/* builder delete begin
dojo.require("dojox.data.demos.widgets.PicasaView");


 builder delete end */
dojo.declare("dojox.data.demos.widgets.PicasaViewList", [dijit._Widget, dijit._Templated], {
	//Simple demo widget that is just a list of PicasaView Widgets.

	templateString: dojo.cache("dojox", "data/demos/widgets/templates/PicasaViewList.html"),

	//Attach points for reference.
	listNode: null,

	postCreate: function(){
		this.fViewWidgets = [];
	},

	clearList: function(){
		while(this.list.firstChild){
			this.list.removeChild(this.list.firstChild);
		}
		for(var i = 0; i < this.fViewWidgets.length; i++){
			this.fViewWidgets[i].destroy();
		}
		this.fViewWidgets = [];
	},

	addView: function(viewData){
		 var newView  = new dojox.data.demos.widgets.PicasaView(viewData);
		 this.fViewWidgets.push(newView);
		 this.list.appendChild(newView.domNode);
	}
});

});
require(["dojox/data/demos/widgets/PicasaViewList"]);
