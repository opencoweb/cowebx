/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo/_base/kernel",".","./_Widget","./_KeyNavContainer","./_TemplatedMixin","dojo/_base/connect","dojo/_base/declare"],function(_1,_2){_1.declare("dijit.Toolbar",[_2._Widget,_2._TemplatedMixin,_2._KeyNavContainer],{templateString:"<div class=\"dijit\" role=\"toolbar\" tabIndex=\"${tabIndex}\" dojoAttachPoint=\"containerNode\">"+"</div>",baseClass:"dijitToolbar",postCreate:function(){this.inherited(arguments);this.connectKeyNavHandlers(this.isLeftToRight()?[_1.keys.LEFT_ARROW]:[_1.keys.RIGHT_ARROW],this.isLeftToRight()?[_1.keys.RIGHT_ARROW]:[_1.keys.LEFT_ARROW]);}});return _2.Toolbar;});