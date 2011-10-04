/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo/_base/array","./ListItem"],function(_1,_2){return dojo.declare("dojox.mobile._DataListMixin",null,{store:null,query:null,queryOptions:null,buildRendering:function(){this.inherited(arguments);if(!this.store){return;}var _3=this.store;this.store=null;this.setStore(_3,this.query,this.queryOptions);},setStore:function(_4,_5,_6){if(_4===this.store){return;}this.store=_4;this.query=_5;this.queryOptions=_6;if(_4&&_4.getFeatures()["dojo.data.api.Notification"]){dojo.forEach(this._conn||[],dojo.disconnect);this._conn=[dojo.connect(_4,"onSet",this,"onSet"),dojo.connect(_4,"onNew",this,"onNew"),dojo.connect(_4,"onDelete",this,"onDelete")];}this.refresh();},refresh:function(){if(!this.store){return;}this.store.fetch({query:this.query,queryOptions:this.queryOptions,onComplete:dojo.hitch(this,"generateList"),onError:dojo.hitch(this,"onError")});},createListItem:function(_7){var _8={};var _9=this.store.getLabelAttributes(_7);var _a=_9?_9[0]:null;dojo.forEach(this.store.getAttributes(_7),function(_b){if(_b===_a){_8["label"]=this.store.getLabel(_7);}else{_8[_b]=this.store.getValue(_7,_b);}},this);var w=new _2(_8);_7._widgetId=w.id;return w;},generateList:function(_c,_d){dojo.forEach(this.getChildren(),function(_e){_e.destroyRecursive();});dojo.forEach(_c,function(_f,_10){this.addChild(this.createListItem(_f));},this);},onError:function(_11){},onSet:function(_12,_13,_14,_15){},onNew:function(_16,_17){this.addChild(this.createListItem(_16));},onDelete:function(_18){dijit.byId(_18._widgetId).destroyRecursive();}});});