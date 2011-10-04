/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo/_base/html","./ToggleButton","dijit/form/_CheckBoxMixin"],function(_1,_2,_3){return dojo.declare("dojox.mobile.CheckBox",[dojox.mobile.ToggleButton,dijit.form._CheckBoxMixin],{baseClass:"mblCheckBox",_setTypeAttr:function(){},buildRendering:function(){if(!this.srcNodeRef){this.srcNodeRef=dojo.create("input",{type:this.type});}this.inherited(arguments);this.focusNode=this.domNode;}});});