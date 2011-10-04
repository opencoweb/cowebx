/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["../has","require"],function(_1,_2){_1.add("dojo-sniff",_1("dom")?1:0);var _3=this.dojoConfig||this.djConfig||{};if(_1("dom")&&_1("dojo-sniff")&&!_1("dojo-loader")){for(var _4,_5,_6,_7=document.getElementsByTagName("script"),i=0;i<_7.length&&!_6;i++){if((_5=_7[i].getAttribute("src"))&&(_6=_5.match(/(.*)\/?(dojo|require)\.js(\W|$)/i))){_4=(_7[i].getAttribute("data-dojo-config")||_7[i].getAttribute("djConfig"));if(_4){_4=eval("({ "+_4+" })\r\n//@ sourceURL=dojo/config/data-dojo-config");for(var p in _4){_3[p]=_4[p];}}}}}else{var p,_8=_2.rawConfig||{};for(p in _8){_3[p]=_8[p];}}return _3;});