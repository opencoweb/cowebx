/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/mdnd/AreaManager"],function(_1,_2,_3){_1.getObject("dojox.mdnd.DropIndicator",1);_1.declare("dojox.mdnd.DropIndicator",null,{node:null,constructor:function(){var _4=document.createElement("div");var _5=document.createElement("div");_4.appendChild(_5);_1.addClass(_4,"dropIndicator");this.node=_4;},place:function(_6,_7,_8){if(_8){this.node.style.height=_8.h+"px";}try{if(_7){_6.insertBefore(this.node,_7);}else{_6.appendChild(this.node);}return this.node;}catch(e){return null;}},remove:function(){if(this.node){this.node.style.height="";if(this.node.parentNode){this.node.parentNode.removeChild(this.node);}}},destroy:function(){if(this.node){if(this.node.parentNode){this.node.parentNode.removeChild(this.node);}_1._destroyElement(this.node);delete this.node;}}});(function(){_3.mdnd.areaManager()._dropIndicator=new _3.mdnd.DropIndicator();}());});require(["dojox/mdnd/DropIndicator"]);