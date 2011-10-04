/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo/_base/lang","./_base","dijit/_Widget"],function(_1,dd,_2){dd.Inline=_1.extend(function(_3,_4){this.create(_3,_4);},_2.prototype,{context:null,render:function(_5){this.context=_5||this.context;this.postMixInProperties();_1.query("*",this.domNode).orphan();this.domNode.innerHTML=this.template.render(this.context);},declaredClass:"dojox.dtl.Inline",buildRendering:function(){var _6=this.domNode=document.createElement("div");var _7=this.srcNodeRef;if(_7.parentNode){_7.parentNode.replaceChild(_6,_7);}this.template=new dd.Template(_1.trim(_7.text),true);this.render();},postMixInProperties:function(){this.context=(this.context.get===dd._Context.prototype.get)?this.context:new dd._Context(this.context);}});return dojox.dtl.Inline;});