/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dijit/_WidgetBase"],function(_1){return dojo.declare("dojox.mvc.Output",[dijit._WidgetBase],{templateString:"",postscript:function(_2,_3){this.srcNodeRef=dojo.byId(_3);if(this.srcNodeRef){this.templateString=this.srcNodeRef.innerHTML;this.srcNodeRef.innerHTML="";}this.inherited(arguments);},set:function(_4,_5){this.inherited(arguments);if(_4==="value"){this._output();}},_updateBinding:function(_6,_7,_8){this.inherited(arguments);this._output();},_output:function(){var _9=this.srcNodeRef||this.domNode;_9.innerHTML=this.templateString?this._exprRepl(this.templateString):this.value;},_exprRepl:function(_a){var _b=this,_c=function(_d,_e){if(!_d){return "";}var _f=_d.substr(2);_f=_f.substr(0,_f.length-1);return eval(_f,_b)||"";};_c=dojo.hitch(this,_c);return _a.replace(/\$\{.*?\}/g,function(_10,key,_11){return _c(_10,key).toString();});}});});