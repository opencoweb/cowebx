/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo/_base/lang","../_base","../utils/date"],function(_1,dd,_2){_1.getObject("dtl.tag.date",true,dojox);dojox.dtl.tag.date.NowNode=function(_3,_4){this._format=_3;this.format=new _2.DateFormat(_3);this.contents=_4;};_1.extend(dojox.dtl.tag.date.NowNode,{render:function(_5,_6){this.contents.set(this.format.format(new Date()));return this.contents.render(_5,_6);},unrender:function(_7,_8){return this.contents.unrender(_7,_8);},clone:function(_9){return new this.constructor(this._format,this.contents.clone(_9));}});dojox.dtl.tag.date.now=function(_a,_b){var _c=_b.split_contents();if(_c.length!=2){throw new Error("'now' statement takes one argument");}return new dojox.dtl.tag.date.NowNode(_c[1].slice(1,-1),_a.create_text_node());};return dojox.dtl.tag.date;});