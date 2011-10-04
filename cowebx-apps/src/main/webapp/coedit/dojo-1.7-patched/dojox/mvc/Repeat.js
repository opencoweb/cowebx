/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojox/mvc/_Container"],function(_1){return dojo.declare("dojox.mvc.Repeat",[dojox.mvc._Container],{index:0,postscript:function(_2,_3){this.srcNodeRef=dojo.byId(_3);if(this.srcNodeRef){this.templateString=this.srcNodeRef.innerHTML;this.srcNodeRef.innerHTML="";}this.inherited(arguments);},_updateBinding:function(_4,_5,_6){this.inherited(arguments);this._buildContained();},_buildContained:function(){this._destroyBody();this._updateAddRemoveWatch();var _7="";for(this.index=0;this.get("binding").get(this.index);this.index++){_7+=this._exprRepl(this.templateString);}var _8=this.srcNodeRef||this.domNode;_8.innerHTML=_7;this._createBody();},_updateAddRemoveWatch:function(){if(this._addRemoveWatch){this._addRemoveWatch.unwatch();}var _9=this;this._addRemoveWatch=this.get("binding").watch(function(_a,_b,_c){if(/^[0-9]+$/.test(_a.toString())){if(!_b||!_c){_9._buildContained();}}});}});});