/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo/_base/declare","dojo/on","./transition"],function(_1,on,_2){return _1("dojox.mobile.TransitionEvent",null,{constructor:function(_3,_4,_5){this.transitionOptions=_4;this.target=_3;this.triggerEvent=_5||null;},dispatch:function(){var _6={bubbles:true,cancelable:true,detail:this.transitionOptions,triggerEvent:this.triggerEvent};var _7=on.emit(this.target,"startTransition",_6);if(_7){dojo.when(_2.call(this,_7),dojo.hitch(this,function(_8){this.endTransition(_8);}));}},endTransition:function(_9){on.emit(this.target,"endTransition",{detail:_9.transitionOptions});}});});