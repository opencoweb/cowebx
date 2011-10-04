/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["./main","./regexp"],function(_1){_1.cookie=function(_2,_3,_4){var c=document.cookie;if(arguments.length==1){var _5=c.match(new RegExp("(?:^|; )"+_1.regexp.escapeString(_2)+"=([^;]*)"));return _5?decodeURIComponent(_5[1]):undefined;}else{_4=_4||{};var _6=_4.expires;if(typeof _6=="number"){var d=new Date();d.setTime(d.getTime()+_6*24*60*60*1000);_6=_4.expires=d;}if(_6&&_6.toUTCString){_4.expires=_6.toUTCString();}_3=encodeURIComponent(_3);var _7=_2+"="+_3,_8;for(_8 in _4){_7+="; "+_8;var _9=_4[_8];if(_9!==true){_7+="="+_9;}}document.cookie=_7;}};_1.cookie.isSupported=function(){if(!("cookieEnabled" in navigator)){this("__djCookieTest__","CookiesAllowed");navigator.cookieEnabled=this("__djCookieTest__")=="CookiesAllowed";if(navigator.cookieEnabled){this("__djCookieTest__","",{expires:-1});}}return navigator.cookieEnabled;};return _1.cookie;});