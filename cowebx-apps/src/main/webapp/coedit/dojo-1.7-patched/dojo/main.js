/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["./_base/kernel","./has","require","./_base/load","./has!dojo-sync-loader?./_base/loader","./_base/lang","./_base/array","./_base/declare","./_base/Deferred","./_base/json","./_base/Color","./has!dojo-firebug?./_firebug/firebug","./_base/browser"],function(_1,_2,_3){if(_1.config.isDebug){_3(["./_firebug/firebug"]);}_2.add("dojo-load-firebug-console",!!this["loadFirebugConsole"]);if(_2("dojo-load-firebug-console")){loadFirebugConsole();}if(_1.config.debugAtAllCosts){_3.debugAtAllCosts();}_2.add("dojo-config-require",1);if(_2("dojo-config-require")){var _4=_1.config.require;if(_4){_4=_1.map(_1.isArray(_4)?_4:[_4],function(_5){return _5.replace(/\./g,"/");});if(_2("config-isAsync")){_3(_4);}else{_3.ready(1,function(){_3(_4);});}}}_2.add("dojo-config-addOnLoad",1);if(_2("dojo-config-addOnLoad")){var _6=_1.config.addOnLoad;if(_6){_3.ready(_1.isArray(_6)?_1.hitch.apply(_1,_6):_6);}}return _1;});