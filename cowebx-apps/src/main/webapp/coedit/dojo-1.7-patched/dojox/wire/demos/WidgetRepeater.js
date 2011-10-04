/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojo/parser","dijit/_Widget","dijit/_Templated","dijit/_Container"],function(_1,_2,_3){_1.getObject("dojox.wire.demos.WidgetRepeater",1);_1.declare("dojox.wire.demos.WidgetRepeater",[_2._Widget,_2._Templated,_2._Container],{templateString:"<div class='WidgetRepeater' dojoAttachPoint='repeaterNode'></div>",widget:null,repeater:null,createNew:function(_4){try{if(_1.isString(this.widget)){this.widget=_1.getObject(this.widget);}this.addChild(new this.widget(_4));this.repeaterNode.appendChild(document.createElement("br"));}catch(e){}}});});require(["dojox/wire/demos/WidgetRepeater"]);