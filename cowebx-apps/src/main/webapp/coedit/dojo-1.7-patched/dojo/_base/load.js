/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["./kernel","../has","require","./lang"],function(_1,_2,_3){_2.add("dojo-ready-api",0);var _4;if(_2("dojo-ready-api")){_4=_3.ready;}else{var _5=[],_6=0,_7=function(){while(_5.length){(_5.shift())();}_6=0;};_4=function(_8,_9,_a){if(typeof _8!="number"){_a=_9,_9=_8,_8=1000;}_a=_1.hitch(_9,_a);_a.priority=_8;for(var i=0;i<_5.length&&_8<=_5[i].priority;i++){}_5.splice(i,0,_a);if(!_6){_3.ready(_7);_6=1;}};}_1.ready=_1.addOnLoad=_4;_4(function(){_1._postLoad=_1.config.afterOnLoad=true;});var _b=_1.config.addOnLoad;if(_b){_4[(_1.isArray(_b)?"apply":"call")](_1,_b);}});