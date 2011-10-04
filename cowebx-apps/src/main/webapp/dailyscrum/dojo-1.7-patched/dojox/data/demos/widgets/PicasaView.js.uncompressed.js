/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dijit/_Templated","dijit/_Widget"], function(dojo, dijit, dojox){
dojo.getObject("dojox.data.demos.widgets.PicasaView", 1);
/* builder delete begin
dojo.provide("dojox.data.demos.widgets.PicasaView");

 builder delete end */
/* builder delete begin
dojo.require("dijit._Templated");

 builder delete end */
/* builder delete begin
dojo.require("dijit._Widget");


 builder delete end */
dojo.declare("dojox.data.demos.widgets.PicasaView", [dijit._Widget, dijit._Templated], {
	//Simple demo widget for representing a view of a Picasa Item.

	templateString: dojo.cache("dojox", "data/demos/widgets/templates/PicasaView.html"),

	//Attach points for reference.
	titleNode: null,
	descriptionNode: null,
	imageNode: null,
	authorNode: null,

	title: "",
	author: "",
	imageUrl: "",
	iconUrl: "",

	postCreate: function(){
		this.titleNode.appendChild(document.createTextNode(this.title));
		this.authorNode.appendChild(document.createTextNode(this.author));
		this.descriptionNode.appendChild(document.createTextNode(this.description));
		var href = document.createElement("a");
		href.setAttribute("href", this.imageUrl);
		href.setAttribute("target", "_blank");
        var imageTag = document.createElement("img");
		imageTag.setAttribute("src", this.iconUrl);
		href.appendChild(imageTag);
		this.imageNode.appendChild(href);
	}
});

});
require(["dojox/data/demos/widgets/PicasaView"]);
