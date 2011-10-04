/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo/_base/html","dojo/date","dojo/date/locale","./SpinWheel","./SpinWheelSlot"],function(_1,_2,_3,_4,_5){return dojo.declare("dojox.mobile.SpinWheelTimePicker",dojox.mobile.SpinWheel,{slotClasses:[_5,_5],slotProps:[{labelFrom:0,labelTo:23},{labels:["00","01","02","03","04","05","06","07","08","09","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30","31","32","33","34","35","36","37","38","39","40","41","42","43","44","45","46","47","48","49","50","51","52","53","54","55","56","57","58","59"]}],buildRendering:function(){this.inherited(arguments);dojo.addClass(this.domNode,"mblSpinWheelTimePicker");},reset:function(){var _6=this.slots;var _7=new Date();_6[0].setValue(_7.getHours());_6[0].setColor(_7.getHours());_6[1].setValue(_7.getMinutes());_6[1].setColor(_7.getMinutes());}});});