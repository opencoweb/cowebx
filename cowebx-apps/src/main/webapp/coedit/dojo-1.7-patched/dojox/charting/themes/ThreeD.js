/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo/_base/array","../Theme","./gradientGenerator","./PrimaryColors","dojo/colors","./common"],function(_1,_2,_3,_4){var _5=dojox.charting.themes,_6=["#f00","#0f0","#00f","#ff0","#0ff","#f0f","./common"],_7={type:"linear",space:"shape",x1:0,y1:0,x2:100,y2:0},_8=[{o:0,i:174},{o:0.08,i:231},{o:0.18,i:237},{o:0.3,i:231},{o:0.39,i:221},{o:0.49,i:206},{o:0.58,i:187},{o:0.68,i:165},{o:0.8,i:128},{o:0.9,i:102},{o:1,i:174}],_9=2,_a=100,_b=50,_c=_1.map(_6,function(c){var _d=_1.delegate(_7),_6=_d.colors=_3.generateGradientByIntensity(c,_8),_e=_6[_9].color;_e.r+=_a;_e.g+=_a;_e.b+=_a;_e.sanitize();return _d;});_5.ThreeD=_4.clone();_5.ThreeD.series.shadow={dx:1,dy:1,width:3,color:[0,0,0,0.15]};_5.ThreeD.next=function(_f,_10,_11){if(_f=="bar"||_f=="column"){var _12=this._current%this.seriesThemes.length,s=this.seriesThemes[_12],old=s.fill;s.fill=_c[_12];var _13=_2.prototype.next.apply(this,arguments);s.fill=old;return _13;}return _2.prototype.next.apply(this,arguments);};return _5.ThreeD;});