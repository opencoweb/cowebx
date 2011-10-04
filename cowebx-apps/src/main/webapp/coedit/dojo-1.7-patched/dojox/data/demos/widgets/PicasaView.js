/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dijit/_Templated","dijit/_Widget"],function(_1,_2,_3){_1.getObject("dojox.data.demos.widgets.PicasaView",1);_1.declare("dojox.data.demos.widgets.PicasaView",[_2._Widget,_2._Templated],{templateString:_1.cache("dojox","data/demos/widgets/templates/PicasaView.html"),titleNode:null,descriptionNode:null,imageNode:null,authorNode:null,title:"",author:"",imageUrl:"",iconUrl:"",postCreate:function(){this.titleNode.appendChild(document.createTextNode(this.title));this.authorNode.appendChild(document.createTextNode(this.author));this.descriptionNode.appendChild(document.createTextNode(this.description));var _4=document.createElement("a");_4.setAttribute("href",this.imageUrl);_4.setAttribute("target","_blank");var _5=document.createElement("img");_5.setAttribute("src",this.iconUrl);_4.appendChild(_5);this.imageNode.appendChild(_4);}});});require(["dojox/data/demos/widgets/PicasaView"]);