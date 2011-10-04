/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo/_base/html",".","./contrib/dijit","./render/dom","dojo/cache","dijit/_Templated"],function(_1,_2,_3,_4){_2._DomTemplated=function(){};_2._DomTemplated.prototype={_dijitTemplateCompat:false,buildRendering:function(){this.domNode=this.srcNodeRef;if(!this._render){var _5=_3.widgetsInTemplate;_3.widgetsInTemplate=this.widgetsInTemplate;this.template=this.template||this._getCachedTemplate(this.templatePath,this.templateString);this._render=new _4.Render(this.domNode,this.template);_3.widgetsInTemplate=_5;}var _6=this._getContext();if(!this._created){delete _6._getter;}this.render(_6);this.domNode=this.template.getRootNode();if(this.srcNodeRef&&this.srcNodeRef.parentNode){_1.destroy(this.srcNodeRef);delete this.srcNodeRef;}},setTemplate:function(_7,_8){if(dojox.dtl.text._isTemplate(_7)){this.template=this._getCachedTemplate(null,_7);}else{this.template=this._getCachedTemplate(_7);}this.render(_8);},render:function(_9,_a){if(_a){this.template=_a;}this._render.render(this._getContext(_9),this.template);},_getContext:function(_b){if(!(_b instanceof dojox.dtl.Context)){_b=false;}_b=_b||new dojox.dtl.Context(this);_b.setThis(this);return _b;},_getCachedTemplate:function(_c,_d){if(!this._templates){this._templates={};}if(!_d){_d=_1.cache(_c,{sanitize:true});}var _e=_d;var _f=this._templates;if(_f[_e]){return _f[_e];}return (_f[_e]=new dojox.dtl.DomTemplate(dijit._TemplatedMixin.getCachedTemplate(_d,true)));}};return dojox.dtl._DomTemplated;});