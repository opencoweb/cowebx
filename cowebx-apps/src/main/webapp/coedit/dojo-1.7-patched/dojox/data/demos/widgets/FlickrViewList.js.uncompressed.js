/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/dtl/_Templated","dijit/_Widget"], function(dojo, dijit, dojox){
dojo.getObject("dojox.data.demos.widgets.FlickrViewList", 1);
/* builder delete begin
dojo.provide("dojox.data.demos.widgets.FlickrViewList");

 builder delete end */
/* builder delete begin
dojo.require("dojox.dtl._Templated");

 builder delete end */
/* builder delete begin
dojo.require("dijit._Widget");


 builder delete end */
dojo.declare("dojox.data.demos.widgets.FlickrViewList",
	[ dijit._Widget, dojox.dtl._Templated ],
	{
		store: null,
		items: null,

		templateString: dojo.cache("dojox", "data/demos/widgets/templates/FlickrViewList.html"),
	
		fetch: function(request){
			request.onComplete = dojo.hitch(this, "onComplete");
			request.onError = dojo.hitch(this, "onError");
			return this.store.fetch(request);
		},

		onError: function(){
			console.trace();
			this.items = [];
			this.render();
		},

		onComplete: function(items, request){
			this.items = items||[];
			this.render();
		}
	}
);

});
require(["dojox/data/demos/widgets/FlickrViewList"]);
