/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dojo/Stateful"],function(_1,_2){_1.getObject("mvc",true,dojox);_1.mixin(dojox.mvc,{bind:function(_3,_4,_5,_6,_7,_8){var _9;return _3.watch(_4,function(_a,_b,_c){_9=_1.isFunction(_7)?_7(_c):_c;if(!_8||_9!=_5.get(_6)){_5.set(_6,_9);}});},bindInputs:function(_d,_e){var _f=[];_1.forEach(_d,function(h){_f.push(h.watch("value",_e));});return _f;}});return dojox.mvc;});