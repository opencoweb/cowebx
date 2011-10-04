/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo/_base/array","dojo/_base/html","dijit/_WidgetBase","dijit/_Contained","./_ScrollableMixin"],function(_1,_2,_3,_4,_5){return dojo.declare("dojox.mobile.SpinWheelSlot",[dijit._WidgetBase,dijit._Contained,dojox.mobile._ScrollableMixin],{items:[],labels:[],labelFrom:0,labelTo:0,maxSpeed:500,minItems:15,centerPos:0,value:"",scrollBar:false,constraint:false,buildRendering:function(){this.inherited(arguments);dojo.addClass(this.domNode,"mblSpinWheelSlot");var i,j,_6;if(this.labelFrom!==this.labelTo){this.labels=[];for(i=this.labelFrom,_6=0;i<=this.labelTo;i++,_6++){this.labels[_6]=String(i);}}if(this.labels.length>0){this.items=[];for(i=0;i<this.labels.length;i++){this.items.push([i,this.labels[i]]);}}this.containerNode=dojo.create("DIV",{className:"mblSpinWheelSlotContainer"});this.containerNode.style.height=(dojo.global.innerHeight||dojo.doc.documentElement.clientHeight)*2+"px";this.panelNodes=[];for(k=0;k<3;k++){this.panelNodes[k]=dojo.create("DIV",{className:"mblSpinWheelSlotPanel"});var _7=this.items.length;var n=Math.ceil(this.minItems/_7);for(j=0;j<n;j++){for(i=0;i<_7;i++){dojo.create("DIV",{className:"mblSpinWheelSlotLabel",name:this.items[i][0],innerHTML:this._cv(this.items[i][1])},this.panelNodes[k]);}}this.containerNode.appendChild(this.panelNodes[k]);}this.domNode.appendChild(this.containerNode);this.touchNode=dojo.create("DIV",{className:"mblSpinWheelSlotTouch"},this.domNode);this.setSelectable(this.domNode,false);},startup:function(){this.inherited(arguments);this.centerPos=this.getParent().centerPos;var _8=this.panelNodes[1].childNodes;this._itemHeight=_8[0].offsetHeight;var _9=this;setTimeout(function(){_9.adjust();},0);},adjust:function(){var _a=this.panelNodes[1].childNodes;var _b;for(var i=0,_c=_a.length;i<_c;i++){var _d=_a[i];if(_d.offsetTop<=this.centerPos&&this.centerPos<_d.offsetTop+_d.offsetHeight){_b=this.centerPos-(_d.offsetTop+Math.round(_d.offsetHeight/2));break;}}var h=this.panelNodes[0].offsetHeight;this.panelNodes[0].style.top=-h+_b+"px";this.panelNodes[1].style.top=_b+"px";this.panelNodes[2].style.top=h+_b+"px";},setInitialValue:function(){if(this.items.length>0){var _e=(this.value!=="")?this.value:this.items[0][1];this.setValue(_e);}},getCenterPanel:function(){var _f=this.getPos();for(var i=0,len=this.panelNodes.length;i<len;i++){var top=_f.y+this.panelNodes[i].offsetTop;if(top<=this.centerPos&&this.centerPos<top+this.panelNodes[i].offsetHeight){return this.panelNodes[i];}}return null;},setColor:function(_10){for(var i=0,len=this.panelNodes.length;i<len;i++){var _11=this.panelNodes[i].childNodes;for(var j=0;j<_11.length;j++){if(_11[j].innerHTML===String(_10)){dojo.addClass(_11[j],"mblSpinWheelSlotLabelBlue");}else{dojo.removeClass(_11[j],"mblSpinWheelSlotLabelBlue");}}}},disableValues:function(_12){for(var i=0,len=this.panelNodes.length;i<len;i++){var _13=this.panelNodes[i].childNodes;for(var j=0;j<_13.length;j++){dojo.removeClass(_13[j],"mblSpinWheelSlotLabelGray");for(var k=0;k<_12.length;k++){if(_13[j].innerHTML===String(_12[k])){dojo.addClass(_13[j],"mblSpinWheelSlotLabelGray");break;}}}}},getCenterItem:function(){var pos=this.getPos();var _14=this.getCenterPanel();var top=pos.y+_14.offsetTop;var _15=_14.childNodes;for(var i=0,len=_15.length;i<len;i++){if(top+_15[i].offsetTop<=this.centerPos&&this.centerPos<top+_15[i].offsetTop+_15[i].offsetHeight){return _15[i];}}return null;},getValue:function(){return this.getCenterItem().innerHTML;},getKey:function(){return this.getCenterItem().getAttribute("name");},setValue:function(_16){var _17,_18;var _19=this.getValue();var n=this.items.length;for(var i=0;i<n;i++){if(this.items[i][1]===String(_19)){_17=i;}if(this.items[i][1]===String(_16)){_18=i;}if(_17!==undefined&&_18!==undefined){break;}}var d=_18-_17;var m;if(d>0){m=(d<n-d)?-d:n-d;}else{m=(-d<n+d)?-d:-(n+d);}var to=this.getPos();to.y+=m*this._itemHeight;this.slideTo(to,1);},getSpeed:function(){var y=0,n=this._time.length;var _1a=(new Date()).getTime()-this.startTime-this._time[n-1];if(n>=2&&_1a<200){var dy=this._posY[n-1]-this._posY[(n-6)>=0?n-6:0];var dt=this._time[n-1]-this._time[(n-6)>=0?n-6:0];y=this.calcSpeed(dy,dt);}return {x:0,y:y};},calcSpeed:function(d,t){var _1b=this.inherited(arguments);if(!_1b){return 0;}var v=Math.abs(_1b);var ret=_1b;if(v>this.maxSpeed){ret=this.maxSpeed*(_1b/v);}return ret;},adjustDestination:function(to,pos){var h=this._itemHeight;var j=to.y+Math.round(h/2);var a=Math.abs(j);var r=j>=0?j%h:j%h+h;to.y=j-r;},slideTo:function(to,_1c,_1d){var pos=this.getPos();var top=pos.y+this.panelNodes[1].offsetTop;var _1e=top+this.panelNodes[1].offsetHeight;var vh=this.domNode.parentNode.offsetHeight;var t;if(pos.y<to.y){if(_1e>vh){t=this.panelNodes[2];t.style.top=this.panelNodes[0].offsetTop-this.panelNodes[0].offsetHeight+"px";this.panelNodes[2]=this.panelNodes[1];this.panelNodes[1]=this.panelNodes[0];this.panelNodes[0]=t;}}else{if(pos.y>to.y){if(top<0){t=this.panelNodes[0];t.style.top=this.panelNodes[2].offsetTop+this.panelNodes[2].offsetHeight+"px";this.panelNodes[0]=this.panelNodes[1];this.panelNodes[1]=this.panelNodes[2];this.panelNodes[2]=t;}}}if(Math.abs(this._speed.y)<40){_1c=0.2;}this.inherited(arguments);}});});