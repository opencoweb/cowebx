/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojo/fx","dijit/layout/StackContainer","dijit/layout/StackController","dijit/_Widget","dijit/_Templated","dijit/_Contained"],function(_1,_2,_3){_1.getObject("dojox.layout.RotatorContainer",1);_1.declare("dojox.layout.RotatorContainer",[_2.layout.StackContainer,_2._Templated],{templateString:"<div class=\"dojoxRotatorContainer\"><div dojoAttachPoint=\"tabNode\"></div><div class=\"dojoxRotatorPager\" dojoAttachPoint=\"pagerNode\"></div><div class=\"dojoxRotatorContent\" dojoAttachPoint=\"containerNode\"></div></div>",showTabs:true,transitionDelay:5000,transition:"fade",transitionDuration:1000,autoStart:true,suspendOnHover:false,pauseOnManualChange:null,reverse:false,pagerId:"",cycles:-1,pagerClass:"dojox.layout.RotatorPager",postCreate:function(){this.inherited(arguments);_1.style(this.domNode,"position","relative");if(this.cycles-0==this.cycles&&this.cycles!=-1){this.cycles++;}else{this.cycles=-1;}if(this.pauseOnManualChange===null){this.pauseOnManualChange=!this.suspendOnHover;}var id=this.id||"rotator"+(new Date()).getTime(),sc=new _2.layout.StackController({containerId:id},this.tabNode);this.tabNode=sc.domNode;this._stackController=sc;_1.style(this.tabNode,"display",this.showTabs?"":"none");this.connect(sc,"onButtonClick","_manualChange");this._subscriptions=[_1.subscribe(this.id+"-cycle",this,"_cycle"),_1.subscribe(this.id+"-state",this,"_state")];var d=Math.round(this.transitionDelay*0.75);if(d<this.transitionDuration){this.transitionDuration=d;}if(this.suspendOnHover){this.connect(this.domNode,"onmouseover","_onMouseOver");this.connect(this.domNode,"onmouseout","_onMouseOut");}},startup:function(){if(this._started){return;}var c=this.getChildren();for(var i=0,_4=c.length;i<_4;i++){if(c[i].declaredClass==this.pagerClass){this.pagerNode.appendChild(c[i].domNode);break;}}this.inherited(arguments);if(this.autoStart){setTimeout(_1.hitch(this,"_play"),10);}else{this._updatePager();}},destroy:function(){_1.forEach(this._subscriptions,_1.unsubscribe);this.inherited(arguments);},_setShowTabsAttr:function(_5){this.showTabs=_5;_1.style(this.tabNode,"display",_5?"":"none");},_updatePager:function(){var c=this.getChildren();_1.publish(this.id+"-update",[this._playing,_1.indexOf(c,this.selectedChildWidget)+1,c.length]);},_onMouseOver:function(){this._resetTimer();this._over=true;},_onMouseOut:function(){this._over=false;if(this._playing){clearTimeout(this._timer);this._timer=setTimeout(_1.hitch(this,"_play",true),200);}},_resetTimer:function(){clearTimeout(this._timer);this._timer=null;},_cycle:function(_6){if(_6 instanceof Boolean||typeof _6=="boolean"){this._manualChange();}var c=this.getChildren(),_7=c.length,i=_1.indexOf(c,this.selectedChildWidget)+(_6===false||(_6!==true&&this.reverse)?-1:1);this.selectChild(c[(i<_7?(i<0?_7-1:i):0)]);this._updatePager();},_manualChange:function(){if(this.pauseOnManualChange){this._playing=false;}this.cycles=-1;},_play:function(_8){this._playing=true;this._resetTimer();if(_8!==true&&this.cycles>0){this.cycles--;}if(this.cycles==0){this._pause();}else{if((!this.suspendOnHover||!this._over)&&this.transitionDelay){this._timer=setTimeout(_1.hitch(this,"_cycle"),this.selectedChildWidget.domNode.getAttribute("transitionDelay")||this.transitionDelay);}}this._updatePager();},_pause:function(){this._playing=false;this._resetTimer();},_state:function(_9){if(_9){this.cycles=-1;this._play();}else{this._pause();}},_transition:function(_a,_b){this._resetTimer();if(_b&&this.transitionDuration){switch(this.transition){case "fade":this._fade(_a,_b);return;}}this._transitionEnd();this.inherited(arguments);},_transitionEnd:function(){if(this._playing){this._play();}else{this._updatePager();}},_fade:function(_c,_d){this._styleNode(_d.domNode,1,1);this._styleNode(_c.domNode,0,2);this._showChild(_c);if(this.doLayout&&_c.resize){_c.resize(this._containerContentBox||this._contentBox);}var _e={duration:this.transitionDuration},_f=_1.fx.combine([_1["fadeOut"](_1.mixin({node:_d.domNode},_e)),_1["fadeIn"](_1.mixin({node:_c.domNode},_e))]);this.connect(_f,"onEnd",_1.hitch(this,function(){this._hideChild(_d);this._transitionEnd();}));_f.play();},_styleNode:function(_10,_11,_12){_1.style(_10,"opacity",_11);_1.style(_10,"zIndex",_12);_1.style(_10,"position","absolute");}});_1.declare("dojox.layout.RotatorPager",[_2._Widget,_2._Templated,_2._Contained],{widgetsInTemplate:true,rotatorId:"",postMixInProperties:function(){this.templateString="<div>"+this.srcNodeRef.innerHTML+"</div>";},postCreate:function(){var p=_2.byId(this.rotatorId)||this.getParent();if(p&&p.declaredClass=="dojox.layout.RotatorContainer"){if(this.previous){_1.connect(this.previous,"onClick",function(){_1.publish(p.id+"-cycle",[false]);});}if(this.next){_1.connect(this.next,"onClick",function(){_1.publish(p.id+"-cycle",[true]);});}if(this.playPause){_1.connect(this.playPause,"onClick",function(){this.set("label",this.checked?"Pause":"Play");_1.publish(p.id+"-state",[this.checked]);});}this._subscriptions=[_1.subscribe(p.id+"-state",this,"_state"),_1.subscribe(p.id+"-update",this,"_update")];}},destroy:function(){_1.forEach(this._subscriptions,_1.unsubscribe);this.inherited(arguments);},_state:function(_13){if(this.playPause&&this.playPause.checked!=_13){this.playPause.set("label",_13?"Pause":"Play");this.playPause.set("checked",_13);}},_update:function(_14,_15,_16){this._state(_14);if(this.current&&_15){this.current.innerHTML=_15;}if(this.total&&_16){this.total.innerHTML=_16;}}});});require(["dojox/layout/RotatorContainer"]);