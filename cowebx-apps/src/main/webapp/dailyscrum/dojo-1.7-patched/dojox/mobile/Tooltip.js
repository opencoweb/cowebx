/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo/_base/html","dijit/place","dijit/_WidgetBase"],function(_1,_2,_3){return dojo.declare("dojox.mobile.Tooltip",dijit._WidgetBase,{baseClass:"mblTooltip mblTooltipHidden",buildRendering:function(){this.inherited(arguments);this.anchor=dojo.create("div",{"class":"mblTooltipAnchor"},this.domNode,"first");this.arrow=dojo.create("div",{"class":"mblTooltipArrow"},this.anchor);this.innerArrow=dojo.create("div",{"class":"mblTooltipInnerArrow"},this.anchor);},show:function(_4,_5){var _6={"MRM":"mblTooltipAfter","MLM":"mblTooltipBefore","BMT":"mblTooltipBelow","TMB":"mblTooltipAbove","BLT":"mblTooltipBelow","TLB":"mblTooltipAbove","BRT":"mblTooltipBelow","TRB":"mblTooltipAbove","TLT":"mblTooltipBefore","TRT":"mblTooltipAfter","BRB":"mblTooltipAfter","BLB":"mblTooltipBefore"};dojo.removeClass(this.domNode,["mblTooltipAfter","mblTooltipBefore","mblTooltipBelow","mblTooltipAbove"]);var _7=_2.around(this.domNode,_4,_5||["below-centered","above-centered","after","before"],this.isLeftToRight());var _8=_6[_7.corner+_7.aroundCorner.charAt(0)]||"";dojo.addClass(this.domNode,_8);var _9=dojo.position(_4,true);dojo.style(this.anchor,(_8=="mblTooltipAbove"||_8=="mblTooltipBelow")?{top:"",left:Math.max(0,_9.x-_7.x+(_9.w>>1)-(this.arrow.offsetWidth>>1))+"px"}:{left:"",top:Math.max(0,_9.y-_7.y+(_9.h>>1)-(this.arrow.offsetHeight>>1))+"px"});dojo.replaceClass(this.domNode,"mblTooltipVisible","mblTooltipHidden");this.resize=dojo.hitch(this,"show",_4,_5);return _7;},hide:function(){this.resize=undefined;dojo.replaceClass(this.domNode,"mblTooltipHidden","mblTooltipVisible");},onBlur:function(e){return true;},destroy:function(){if(this.anchor){this.anchor.removeChild(this.innerArrow);this.anchor.removeChild(this.arrow);this.domNode.removeChild(this.anchor);this.anchor=this.arrow=this.innerArrow=undefined;}this.inherited(arguments);}});});