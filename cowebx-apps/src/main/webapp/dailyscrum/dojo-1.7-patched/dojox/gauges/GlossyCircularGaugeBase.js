/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo/_base/kernel","dojo/_base/declare","dojo/_base/lang","dojo/_base/connect","dojox/gfx","./AnalogGauge","./AnalogCircleIndicator","./TextIndicator","./GlossyCircularGaugeNeedle"],function(_1,_2,_3,_4,_5,_6,_7,_8,_9){return _1.declare("dojox.gauges.GlossyCircularGaugeBase",[_6],{_defaultIndicator:_7,_needle:null,_textIndicator:null,_textIndicatorAdded:false,_range:null,value:0,color:"black",needleColor:"#c4c4c4",textIndicatorFont:"normal normal normal 20pt serif",textIndicatorVisible:true,textIndicatorColor:"#c4c4c4",_majorTicksOffset:130,majorTicksInterval:10,_majorTicksLength:5,majorTicksColor:"#c4c4c4",majorTicksLabelPlacement:"inside",_minorTicksOffset:130,minorTicksInterval:5,_minorTicksLength:3,minorTicksColor:"#c4c4c4",noChange:false,title:"",font:"normal normal normal 10pt serif",scalePrecision:0,textIndicatorPrecision:0,_font:null,constructor:function(){this.startAngle=-135;this.endAngle=135;this.min=0;this.max=100;},startup:function(){this.inherited(arguments);if(this._needle){return;}var _a=Math.min((this.width/this._designWidth),(this.height/this._designHeight));this.cx=_a*this._designCx+(this.width-_a*this._designWidth)/2;this.cy=_a*this._designCy+(this.height-_a*this._designHeight)/2;this._range={low:this.min?this.min:0,high:this.max?this.max:100,color:[255,255,255,0]};this.addRange(this._range);this._majorTicksOffset=this._minorTicksOffset=_a*this._majorTicksOffset;this._majorTicksLength=_a*this._majorTicksLength;this._minorTicksLength=_a*this._minorTicksLength;this.setMajorTicks({fixedPrecision:true,precision:this.scalePrecision,font:this._font,offset:this._majorTicksOffset,interval:this.majorTicksInterval,length:this._majorTicksLength,color:this.majorTicksColor,labelPlacement:this.majorTicksLabelPlacement});this.setMinorTicks({offset:this._minorTicksOffset,interval:this.minorTicksInterval,length:this._minorTicksLength,color:this.minorTicksColor});this._needle=new _9({hideValue:true,title:this.title,noChange:this.noChange,color:this.needleColor,value:this.value});this.addIndicator(this._needle);this._textIndicator=new _8({x:_a*this._designTextIndicatorX+(this.width-_a*this._designWidth)/2,y:_a*this._designTextIndicatorY+(this.height-_a*this._designHeight)/2,fixedPrecision:true,precision:this.textIndicatorPrecision,color:this.textIndicatorColor,value:this.value?this.value:this.min,align:"middle",font:this._textIndicatorFont});if(this.textIndicatorVisible){this.addIndicator(this._textIndicator);this._textIndicatorAdded=true;}_1.connect(this._needle,"valueChanged",_1.hitch(this,function(){this.value=this._needle.value;this._textIndicator.update(this._needle.value);this.onValueChanged();}));},onValueChanged:function(){},_setColorAttr:function(_b){this.color=_b?_b:"black";if(this._gaugeBackground&&this._gaugeBackground.parent){this._gaugeBackground.parent.remove(this._gaugeBackground);}if(this._foreground&&this._foreground.parent){this._foreground.parent.remove(this._foreground);}this._gaugeBackground=null;this._foreground=null;this.draw();},_setNeedleColorAttr:function(_c){this.needleColor=_c;if(this._needle){this.removeIndicator(this._needle);this._needle.color=this.needleColor;this._needle.shape=null;this.addIndicator(this._needle);}},_setTextIndicatorColorAttr:function(_d){this.textIndicatorColor=_d;if(this._textIndicator){this._textIndicator.color=this.textIndicatorColor;this.draw();}},_setTextIndicatorFontAttr:function(_e){this.textIndicatorFont=_e;this._textIndicatorFont=_5.splitFontString(_e);if(this._textIndicator){this._textIndicator.font=this._textIndicatorFont;this.draw();}},setMajorTicksOffset:function(_f){this._majorTicksOffset=_f;this._setMajorTicksProperty({"offset":this._majorTicksOffset});return this;},getMajorTicksOffset:function(){return this._majorTicksOffset;},_setMajorTicksIntervalAttr:function(_10){this.majorTicksInterval=_10;this._setMajorTicksProperty({"interval":this.majorTicksInterval});},setMajorTicksLength:function(_11){this._majorTicksLength=_11;this._setMajorTicksProperty({"length":this._majorTicksLength});return this;},getMajorTicksLength:function(){return this._majorTicksLength;},_setMajorTicksColorAttr:function(_12){this.majorTicksColor=_12;this._setMajorTicksProperty({"color":this.majorTicksColor});},_setMajorTicksLabelPlacementAttr:function(_13){this.majorTicksLabelPlacement=_13;this._setMajorTicksProperty({"labelPlacement":this.majorTicksLabelPlacement});},_setMajorTicksProperty:function(_14){if(this.majorTicks){_1.mixin(this.majorTicks,_14);this.setMajorTicks(this.majorTicks);}},setMinorTicksOffset:function(_15){this._minorTicksOffset=_15;this._setMinorTicksProperty({"offset":this._minorTicksOffset});return this;},getMinorTicksOffset:function(){return this._minorTicksOffset;},_setMinorTicksIntervalAttr:function(_16){this.minorTicksInterval=_16;this._setMinorTicksProperty({"interval":this.minorTicksInterval});},setMinorTicksLength:function(_17){this._minorTicksLength=_17;this._setMinorTicksProperty({"length":this._minorTicksLength});return this;},getMinorTicksLength:function(){return this._minorTicksLength;},_setMinorTicksColorAttr:function(_18){this.minorTicksColor=_18;this._setMinorTicksProperty({"color":this.minorTicksColor});},_setMinorTicksProperty:function(_19){if(this.minorTicks){_1.mixin(this.minorTicks,_19);this.setMinorTicks(this.minorTicks);}},_setMinAttr:function(min){this.min=min;if(this.majorTicks!=null){this.setMajorTicks(this.majorTicks);}if(this.minorTicks!=null){this.setMinorTicks(this.minorTicks);}this.draw();this._updateNeedle();},_setMaxAttr:function(max){this.max=max;if(this.majorTicks!=null){this.setMajorTicks(this.majorTicks);}if(this.minorTicks!=null){this.setMinorTicks(this.minorTicks);}this.draw();this._updateNeedle();},_setScalePrecisionAttr:function(_1a){this.scalePrecision=_1a;this._setMajorTicksProperty({"precision":_1a});},_setTextIndicatorPrecisionAttr:function(_1b){this.textIndicatorPrecision=_1b;this._setMajorTicksProperty({"precision":_1b});},_setValueAttr:function(_1c){_1c=Math.min(this.max,_1c);_1c=Math.max(this.min,_1c);this.value=_1c;if(this._needle){var _1d=this._needle.noChange;this._needle.noChange=false;this._needle.update(_1c);this._needle.noChange=_1d;}},_setNoChangeAttr:function(_1e){this.noChange=_1e;if(this._needle){this._needle.noChange=this.noChange;}},_setTextIndicatorVisibleAttr:function(_1f){this.textIndicatorVisible=_1f;if(this._textIndicator&&this._needle){if(this.textIndicatorVisible&&!this._textIndicatorAdded){this.addIndicator(this._textIndicator);this._textIndicatorAdded=true;this.moveIndicatorToFront(this._needle);}else{if(!this.textIndicatorVisible&&this._textIndicatorAdded){this.removeIndicator(this._textIndicator);this._textIndicatorAdded=false;}}}},_setTitleAttr:function(_20){this.title=_20;if(this._needle){this._needle.title=this.title;}},_setOrientationAttr:function(_21){this.orientation=_21;if(this.majorTicks!=null){this.setMajorTicks(this.majorTicks);}if(this.minorTicks!=null){this.setMinorTicks(this.minorTicks);}this.draw();this._updateNeedle();},_updateNeedle:function(){this.value=Math.max(this.min,this.value);this.value=Math.min(this.max,this.value);if(this._needle){var _22=this._needle.noChange;this._needle.noChange=false;this._needle.update(this.value,false);this._needle.noChange=_22;}},_setFontAttr:function(_23){this.font=_23;this._font=_5.splitFontString(_23);this._setMajorTicksProperty({"font":this._font});}});});