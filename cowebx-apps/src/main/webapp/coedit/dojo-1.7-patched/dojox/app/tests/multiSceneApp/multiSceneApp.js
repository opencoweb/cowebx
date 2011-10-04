/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

var path=window.location.pathname;if(path.charAt(path.length)!="/"){path=path.split("/");path.pop();path=path.join("/");}dojo.registerModulePath("app",path);require(["dojo/_base/html","dojox/app/main","dojo/text!app/config.json"],function(_1,_2,_3){app=_2(eval("("+_3+")"));});