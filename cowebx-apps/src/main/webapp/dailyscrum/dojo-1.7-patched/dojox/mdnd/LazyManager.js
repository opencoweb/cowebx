/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojo/dnd/Manager","dojox/mdnd/PureSource"],function(_1,_2,_3){_1.getObject("dojox.mdnd.LazyManager",1);_1.declare("dojox.mdnd.LazyManager",null,{constructor:function(){this._registry={};this._fakeSource=new _3.mdnd.PureSource(_1.create("div"),{"copyOnly":false});this._fakeSource.startup();_1.addOnUnload(_1.hitch(this,"destroy"));this.manager=_1.dnd.manager();},getItem:function(_4){var _5=_4.getAttribute("dndType");return {"data":_4.getAttribute("dndData")||_4.innerHTML,"type":_5?_5.split(/\s*,\s*/):["text"]};},startDrag:function(e,_6){_6=_6||e.target;if(_6){var m=this.manager,_7=this.getItem(_6);if(_6.id==""){_1.attr(_6,"id",_1.dnd.getUniqueId());}_1.addClass(_6,"dojoDndItem");this._fakeSource.setItem(_6.id,_7);m.startDrag(this._fakeSource,[_6],false);m.onMouseMove(e);}},cancelDrag:function(){var m=this.manager;m.target=null;m.onMouseUp();},destroy:function(){this._fakeSource.destroy();}});});require(["dojox/mdnd/LazyManager"]);