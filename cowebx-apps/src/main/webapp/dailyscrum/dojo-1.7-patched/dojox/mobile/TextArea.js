/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo/_base/html","./TextBox"],function(_1,_2){return dojo.declare("dojox.mobile.TextArea",dojox.mobile.TextBox,{baseClass:"mblTextArea",postMixInProperties:function(){if(!this.value&&this.srcNodeRef){this.value=this.srcNodeRef.value;}this.inherited(arguments);},buildRendering:function(){if(!this.srcNodeRef){this.srcNodeRef=dojo.create("textarea",{});}this.inherited(arguments);}});});