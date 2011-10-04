/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo/_base/lang","../Context","../dom","dojo/_base/html","dojo/_base/kernel"],function(_1,_2){_1.getObject("dtl.render.dom",true,dojox);dojox.dtl.render.dom.Render=function(_3,_4){this._tpl=_4;this.domNode=_1.byId(_3);};_1.extend(dojox.dtl.render.dom.Render,{setAttachPoint:function(_5){this.domNode=_5;},render:function(_6,_7,_8){if(!this.domNode){throw new Error("You cannot use the Render object without specifying where you want to render it");}this._tpl=_7=_7||this._tpl;_8=_8||_7.getBuffer();_6=_6||new _2();var _9=_7.render(_6,_8).getParent();if(!_9){throw new Error("Rendered template does not have a root node");}if(this.domNode!==_9){this.domNode.parentNode.replaceChild(_9,this.domNode);this.domNode=_9;}}});return dojox.dtl.render.dom;});