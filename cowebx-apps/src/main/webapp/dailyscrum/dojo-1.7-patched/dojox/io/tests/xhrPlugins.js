/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["doh","dojo/_base/kernel","dojo/_base/xhr","dojox/io/xhrPlugins","dojo/_base/url"],function(_1,_2,_3,_4){_4.addCrossSiteXhr("http://cssupportingsite.com/");var _5=_2.moduleUrl("dojox.io","tests/crossSite.php");_5=_5.toString();_1.register("dojox.io.tests.xhrPlugins",[function getLocal(t){var d=new _1.Deferred();var _6=_3("GET",{url:_5});_6.addCallback(function(_7){d.callback(_7.match(/response/));});return d;},function crossSiteRequest(t){var d=new _1.Deferred();_4.addCrossSiteXhr("http://persevere.sitepen.com/");try{var _8=_3("GET",{url:"http://persevere.sitepen.com/SMD"});}catch(e){if(e.message.match(/No match/)){return false;}throw e;}_8.addCallback(function(_9){d.callback(_9.match(/transport/));});return d;},function proxiedRequest(t){var d=new _1.Deferred();_4.addProxy(_5+"?url=");var _a=_3("GET",{url:"http://someforeignsite.com/SMD"});_a.addCallback(function(_b){d.callback(_b.match(/proxied/));});return d;}]);});