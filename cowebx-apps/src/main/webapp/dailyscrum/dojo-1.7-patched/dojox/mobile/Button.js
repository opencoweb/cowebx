/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo/_base/array","dojo/_base/html","dijit/_WidgetBase","dijit/form/_FormWidgetMixin","dijit/form/_ButtonMixin"],function(_1,_2,_3,_4,_5){return dojo.declare("dojox.mobile.Button",[dijit._WidgetBase,dijit.form._FormWidgetMixin,dijit.form._ButtonMixin],{baseClass:"mblButton",duration:1000,_onClick:function(e){var _6=this.inherited(arguments);if(_6&&this.duration>=0){var _7=this.focusNode||this.domNode;var _8=(this.baseClass+" "+this["class"]).split(" ");_8=dojo.map(_8,function(c){return c+"Selected";});dojo.addClass(_7,_8);setTimeout(function(){dojo.removeClass(_7,_8);},this.duration);}return _6;},buildRendering:function(){if(!this.srcNodeRef){this.srcNodeRef=dojo.create("button",{"type":this.type});}this.inherited(arguments);this.focusNode=this.domNode;},postCreate:function(){this.inherited(arguments);this.connect(this.domNode,"onclick","_onClick");}});});