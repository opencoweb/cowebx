/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dijit/Dialog","dojox/layout/ContentPane"], function(dojo, dijit, dojox){
dojo.getObject("dojox.widget.DialogSimple", 1);
/* builder delete begin
dojo.provide("dojox.widget.DialogSimple");


 builder delete end */
/* builder delete begin
dojo.require('dijit.Dialog');

 builder delete end */
/* builder delete begin
dojo.require("dojox.layout.ContentPane");


 builder delete end */
dojo.declare("dojox.widget.DialogSimple", [dojox.layout.ContentPane, dijit._DialogBase], {
	// summary: A Simple Dialog Mixing the `dojox.layout.ContentPane` functionality over
	//		top of a vanilla `dijit.Dialog`. See `dojox.widget.Dialog` for a more flexible
	//		dialog option allowing animations and different styles/theme support.
});

});
require(["dojox/widget/DialogSimple"]);
