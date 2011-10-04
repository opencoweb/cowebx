/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo/_base/lang","dojo/_base/Color","dojo/colors"],function(_1,_2,_3){_1.getObject("color",true,dojox);dojox.color.Color=_2;dojox.color.blend=_1.blendColors;dojox.color.fromRgb=_1.colorFromRgb;dojox.color.fromHex=_1.colorFromHex;dojox.color.fromArray=_1.colorFromArray;dojox.color.fromString=_1.colorFromString;dojox.color.greyscale=_3.makeGrey;_1.mixin(dojox.color,{fromCmy:function(_4,_5,_6){if(_1.isArray(_4)){_5=_4[1],_6=_4[2],_4=_4[0];}else{if(_1.isObject(_4)){_5=_4.m,_6=_4.y,_4=_4.c;}}_4/=100,_5/=100,_6/=100;var r=1-_4,g=1-_5,b=1-_6;return new dojox.color.Color({r:Math.round(r*255),g:Math.round(g*255),b:Math.round(b*255)});},fromCmyk:function(_7,_8,_9,_a){if(_1.isArray(_7)){_8=_7[1],_9=_7[2],_a=_7[3],_7=_7[0];}else{if(_1.isObject(_7)){_8=_7.m,_9=_7.y,_a=_7.b,_7=_7.c;}}_7/=100,_8/=100,_9/=100,_a/=100;var r,g,b;r=1-Math.min(1,_7*(1-_a)+_a);g=1-Math.min(1,_8*(1-_a)+_a);b=1-Math.min(1,_9*(1-_a)+_a);return new dojox.color.Color({r:Math.round(r*255),g:Math.round(g*255),b:Math.round(b*255)});},fromHsl:function(_b,_c,_d){if(_1.isArray(_b)){_c=_b[1],_d=_b[2],_b=_b[0];}else{if(_1.isObject(_b)){_c=_b.s,_d=_b.l,_b=_b.h;}}_c/=100;_d/=100;while(_b<0){_b+=360;}while(_b>=360){_b-=360;}var r,g,b;if(_b<120){r=(120-_b)/60,g=_b/60,b=0;}else{if(_b<240){r=0,g=(240-_b)/60,b=(_b-120)/60;}else{r=(_b-240)/60,g=0,b=(360-_b)/60;}}r=2*_c*Math.min(r,1)+(1-_c);g=2*_c*Math.min(g,1)+(1-_c);b=2*_c*Math.min(b,1)+(1-_c);if(_d<0.5){r*=_d,g*=_d,b*=_d;}else{r=(1-_d)*r+2*_d-1;g=(1-_d)*g+2*_d-1;b=(1-_d)*b+2*_d-1;}return new dojox.color.Color({r:Math.round(r*255),g:Math.round(g*255),b:Math.round(b*255)});},fromHsv:function(_e,_f,_10){if(_1.isArray(_e)){_f=_e[1],_10=_e[2],_e=_e[0];}else{if(_1.isObject(_e)){_f=_e.s,_10=_e.v,_e=_e.h;}}if(_e==360){_e=0;}_f/=100;_10/=100;var r,g,b;if(_f==0){r=_10,b=_10,g=_10;}else{var _11=_e/60,i=Math.floor(_11),f=_11-i;var p=_10*(1-_f);var q=_10*(1-(_f*f));var t=_10*(1-(_f*(1-f)));switch(i){case 0:r=_10,g=t,b=p;break;case 1:r=q,g=_10,b=p;break;case 2:r=p,g=_10,b=t;break;case 3:r=p,g=q,b=_10;break;case 4:r=t,g=p,b=_10;break;case 5:r=_10,g=p,b=q;break;}}return new dojox.color.Color({r:Math.round(r*255),g:Math.round(g*255),b:Math.round(b*255)});}});_1.extend(dojox.color.Color,{toCmy:function(){var _12=1-(this.r/255),_13=1-(this.g/255),_14=1-(this.b/255);return {c:Math.round(_12*100),m:Math.round(_13*100),y:Math.round(_14*100)};},toCmyk:function(){var _15,_16,_17,_18;var r=this.r/255,g=this.g/255,b=this.b/255;_18=Math.min(1-r,1-g,1-b);_15=(1-r-_18)/(1-_18);_16=(1-g-_18)/(1-_18);_17=(1-b-_18)/(1-_18);return {c:Math.round(_15*100),m:Math.round(_16*100),y:Math.round(_17*100),b:Math.round(_18*100)};},toHsl:function(){var r=this.r/255,g=this.g/255,b=this.b/255;var min=Math.min(r,b,g),max=Math.max(r,g,b);var _19=max-min;var h=0,s=0,l=(min+max)/2;if(l>0&&l<1){s=_19/((l<0.5)?(2*l):(2-2*l));}if(_19>0){if(max==r&&max!=g){h+=(g-b)/_19;}if(max==g&&max!=b){h+=(2+(b-r)/_19);}if(max==b&&max!=r){h+=(4+(r-g)/_19);}h*=60;}return {h:h,s:Math.round(s*100),l:Math.round(l*100)};},toHsv:function(){var r=this.r/255,g=this.g/255,b=this.b/255;var min=Math.min(r,b,g),max=Math.max(r,g,b);var _1a=max-min;var h=null,s=(max==0)?0:(_1a/max);if(s==0){h=0;}else{if(r==max){h=60*(g-b)/_1a;}else{if(g==max){h=120+60*(b-r)/_1a;}else{h=240+60*(r-g)/_1a;}}if(h<0){h+=360;}}return {h:h,s:Math.round(s*100),v:Math.round(max*100)};}});return dojox.color;});