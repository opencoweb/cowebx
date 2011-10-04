/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dijit/_Widget","dijit/TitlePane"],function(_1,_2,_3){_1.getObject("dojox.widget.TitleGroup",1);(function(d){var tp=_2.TitlePane.prototype,_4=function(){var _5=this._dxfindParent&&this._dxfindParent();_5&&_5.selectChild(this);};tp._dxfindParent=function(){var n=this.domNode.parentNode;if(n){n=_2.getEnclosingWidget(n);return n&&n instanceof _3.widget.TitleGroup&&n;}return n;};d.connect(tp,"_onTitleClick",_4);d.connect(tp,"_onTitleKey",function(e){if(!(e&&e.type&&e.type=="keypress"&&e.charOrCode==d.keys.TAB)){_4.apply(this,arguments);}});d.declare("dojox.widget.TitleGroup",_2._Widget,{"class":"dojoxTitleGroup",addChild:function(_6,_7){return _6.placeAt(this.domNode,_7);},removeChild:function(_8){this.domNode.removeChild(_8.domNode);return _8;},selectChild:function(_9){_9&&_1.query("> .dijitTitlePane",this.domNode).forEach(function(n){var tp=_2.byNode(n);tp&&tp!==_9&&tp.open&&tp.toggle();});return _9;}});})(_1);});require(["dojox/widget/TitleGroup"]);