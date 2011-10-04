/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo/_base/html","dojo/_base/array","./Button","dijit/form/_ToggleButtonMixin"],function(_1,_2,_3,_4){return dojo.declare("dojox.mobile.ToggleButton",[dojox.mobile.Button,dijit.form._ToggleButtonMixin],{baseClass:"mblToggleButton",_setCheckedAttr:function(){this.inherited(arguments);var _5=(this.baseClass+" "+this["class"]).replace(/(\S+)\s*/g,"$1Checked ").split(" ");dojo[this.checked?"addClass":"removeClass"](this.focusNode||this.domNode,_5);}});});