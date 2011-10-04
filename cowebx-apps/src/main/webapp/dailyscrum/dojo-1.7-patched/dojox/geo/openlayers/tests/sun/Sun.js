/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo/_base/kernel","dojo/_base/declare"],function(_1,_2){return _1.declare("dojox.geo.openlayers.tests.sun.Sun",null,{constructor:function(_3){if(!_3){_3=new Date();}this._date=_3;},getDate:function(){var d=this._date;if(d==null){d=new Date();this._date=d;}return d;},setDate:function(_4){if(!_4){_4=new Date();}this._date=_4;},clip:function(p,c){if(p.x<c.x1){p.x=c.x1;}if(p.y<c.y2){p.y=c.y2;}if(p.x>c.x2){p.x=c.x2;}if(p.y>c.y1){p.y=c.y1;}return p;},twilightZone:function(c){var _5=[];clip=function(p,c){if(p.x<c.x1){p.x=c.x1;}if(p.y<c.y2){p.y=c.y2;}if(p.x>c.x2){p.x=c.x2;}if(p.y>c.y1){p.y=c.y1;}return p;};addPoint=function(p){if(c){p=this.clip(p,c);}_5.push(p);};sLon=-180;sLat=-90;eLon=180;eLat=90;if(c){if(sLon<c.x1){sLon=c.x1;}if(sLat<c.y2){sLat=c.y2;}if(eLon>c.x2){eLon=c.x2;}if(eLat>c.y1){eLat=c.y1;}}var dt=this.getDate();var LT=dt.getUTCHours()+dt.getUTCMinutes()/60;var _6=15*(LT-12);var o=this.sunDecRa();var _7=o.dec;var _8=1;var _9=Math.PI/180;for(var i=sLon;i<=eLon;i+=_8){var _a=i+_6;var _b=-Math.cos(_a*_9)/Math.tan(_7*_9);var _c=Math.atan(_b)/_9;addPoint({x:i,y:_c});}if(_7<0){addPoint({x:180,y:-85});addPoint({x:-180,y:-85});addPoint({x:_5[0].x,y:_5[0].y});}else{addPoint({x:180,y:85});addPoint({x:-180,y:85});}return _5;},sun:function(){var o=this.sunDecRa();var _d=o.dec;var dt=this.getDate();var LT=dt.getUTCHours()+dt.getUTCMinutes()/60;var _e=15*(LT-12);var et=this.et(dt)/60;var p={x:-_e+et,y:_d};return p;},jd:function(_f){var dt;if(_f!=null){dt=_f;}else{dt=this.getDate();}MM=dt.getMonth()+1;DD=dt.getDate();YY=dt.getFullYear();HR=dt.getUTCHours();MN=dt.getUTCMinutes();SC=0;with(Math){HR=HR+(MN/60)+(SC/3600);GGG=1;if(YY<=1585){GGG=0;}JD=-1*floor(7*(floor((MM+9)/12)+YY)/4);S=1;if((MM-9)<0){S=-1;}A=abs(MM-9);J1=floor(YY+S*floor(A/7));J1=-1*floor((floor(J1/100)+1)*3/4);JD=JD+floor(275*MM/9)+DD+(GGG*J1);JD=JD+1721027+2*GGG+367*YY-0.5;JD=JD+(HR/24);}return JD;},sunDecRa:function(){var jd=this.jd();var PI2=2*Math.PI;var _10=0.917482;var _11=0.397778;var M,DL,L,SL,X,Y,Z,R;var T,dec,ra;T=(jd-2451545)/36525;M=PI2*this.frac(0.993133+99.997361*T);DL=6893*Math.sin(M)+72*Math.sin(2*M);L=PI2*this.frac(0.7859453+M/PI2+(6191.2*T+DL)/1296000);SL=Math.sin(L);X=Math.cos(L);Y=_10*SL;Z=_11*SL;R=Math.sqrt(1-Z*Z);dec=(360/PI2)*Math.atan(Z/R);ra=(48/PI2)*Math.atan(Y/(X+R));if(ra<0){ra=ra+24;}return {dec:dec,ra:ra};},et:function(_12){if(_12==null){_12=this.getDate();}var _13=_12.getUTCFullYear();var _14=_12.getUTCMonth()+1;var day=_12.getUTCDate();var N1=Math.floor((_14*275)/9);var N2=Math.floor((_14+9)/12);var K=1+Math.floor((_13-4*Math.floor(_13/4)+2)/3);var j=N1-N2*K+day-30;var M=357+0.9856*j;var C=1.914*Math.sin(M)+0.02*Math.sin(2*M);var L=280+C+0.9856*j;var R=-2.465*Math.sin(2*L)+0.053*Math.sin(4*L);var ET=(C+R)*4;return ET;},frac:function(x){x=x-Math.floor(x);if(x<0){x=x+1;}return x;}});});