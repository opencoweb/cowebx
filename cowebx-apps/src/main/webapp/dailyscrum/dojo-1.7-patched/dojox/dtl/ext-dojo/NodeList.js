/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo/_base/lang","../_base"],function(_1,dd){_1.getObject("dtl.ext-dojo.NodeList",true,dojox);_1.extend(_1.NodeList,{dtl:function(_2,_3){var d=dd;var _4=this;var _5=function(_6,_7){var _8=_6.render(new d._Context(_7));_4.forEach(function(_9){_9.innerHTML=_8;});};d.text._resolveTemplateArg(_2).addCallback(function(_a){_2=new d.Template(_a);d.text._resolveContextArg(_3).addCallback(function(_b){_5(_2,_b);});});return this;}});return dojox.dtl.ext-_1.NodeList;});