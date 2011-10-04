/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojo/parser","dijit/_Widget","dijit/_Templated","dijit/_Container"], function(dojo, dijit, dojox){
dojo.getObject("dojox.wire.demos.WidgetRepeater", 1);
/* builder delete begin
dojo.provide("dojox.wire.demos.WidgetRepeater")
		

 builder delete end */
/* builder delete begin
dojo.require("dojo.parser");

 builder delete end */
/* builder delete begin
dojo.require("dijit._Widget");

 builder delete end */
/* builder delete begin
dojo.require("dijit._Templated");

 builder delete end */
/* builder delete begin
dojo.require("dijit._Container");


 builder delete end */
dojo.declare("dojox.wire.demos.WidgetRepeater", [ dijit._Widget, dijit._Templated, dijit._Container ], {
	//	summary:
	//		Simple widget that does generation of widgets repetatively, based on calls to
	//		the createNew function and contains them as child widgets.
	templateString: "<div class='WidgetRepeater' dojoAttachPoint='repeaterNode'></div>",
	widget: null,
	repeater: null,
	createNew: function(obj){
		//	summary:
		//		Function to handle the creation of a new widget and appending it into the widget tree.
		//	obj:
		//		The parameters to pass to the widget.
		try{
			if(dojo.isString(this.widget)){
				// dojo.require(this.widget);	confuses new AMD builder, include resource manually first
				this.widget = dojo.getObject(this.widget);
			}
			this.addChild(new this.widget(obj));
			this.repeaterNode.appendChild(document.createElement("br"));
		}catch(e){ console.debug(e); }
	}
});

});
require(["dojox/wire/demos/WidgetRepeater"]);
