/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dijit/_WidgetBase"],function(_1){return dojo.declare("dojox.mvc._Container",[dijit._WidgetBase],{stopParser:true,templateString:"",_containedWidgets:[],_createBody:function(){this._containedWidgets=dojo.parser.parse(this.srcNodeRef,{template:true,inherited:{dir:this.dir,lang:this.lang},propsThis:this,scope:"dojo"});},_destroyBody:function(){if(this._containedWidgets&&this._containedWidgets.length>0){for(var n=this._containedWidgets.length-1;n>-1;n--){var w=this._containedWidgets[n];if(w&&!w._destroyed&&w.destroy){w.destroy();}}}},_exprRepl:function(_2){var _3=this,_4=function(_5,_6){if(!_5){return "";}var _7=_5.substr(2);_7=_7.substr(0,_7.length-1);return eval(_7,_3);};_4=dojo.hitch(this,_4);return _2.replace(/\$\{.*?\}/g,function(_8,_9,_a){return _4(_8,_9).toString();});}});});