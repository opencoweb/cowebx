/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/charting/Theme","dojox/charting/themes/PlotKit/blue"], function(dojo, dijit, dojox){
dojo.getObject("dojox.charting.tests.Theme", 1);
/* builder delete begin
dojo.provide("dojox.charting.tests.Theme");

 builder delete end */
/* builder delete begin
dojo.require("dojox.charting.Theme");

 builder delete end */
/* builder delete begin
dojo.require("dojox.charting.themes.PlotKit.blue");


 builder delete end */
(function(){
	var dxc=dojox.charting, Theme = dxc.Theme;
	var blue=dxc.themes.PlotKit.blue;
	tests.register("dojox.charting.tests.Theme", [
		function testDefineColor(t){
			var args={ num:16, cache:false };
			Theme.defineColors(args);
			var a=blue.colors;
			var s="<table border=1>";
			for(var i=0; i<a.length; i++){
				if(i%8==0){
					if(i>0) s+="</tr>";
					s+="<tr>";
				}
				s+='<td width=16 bgcolor='+a[i]+'>&nbsp;</td>';
			}
			s+="</tr></table>";
			doh.debug(s);

			var args={ num:32, cache: false };
			Theme.defineColors(args);
			var a=blue.colors;
			var s="<table border=1 style=margin-top:12px;>";
			for(var i=0; i<a.length; i++){
				if(i%8==0){
					if(i>0) s+="</tr>";
					s+="<tr>";
				}
				s+='<td width=16 bgcolor='+a[i]+'>&nbsp;</td>';
			}
			s+="</tr></table>";
			doh.debug(s);

			var args={ saturation:20, num:32, cache:false };
			Theme.defineColors(args);
			var a=blue.colors;
			var s="<table border=1 style=margin-top:12px;>";
			for(var i=0; i<a.length; i++){
				if(i%8==0){
					if(i>0) s+="</tr>";
					s+="<tr>";
				}
				s+='<td width=16 bgcolor='+a[i]+'>&nbsp;</td>';
			}
			s+="</tr></table>";
			doh.debug(s);

			var args={ low:10, high:90, num:32, cache: false };
			Theme.defineColors(args);
			var a=blue.colors;
			var s="<table border=1 style=margin-top:12px;>";
			for(var i=0; i<a.length; i++){
				if(i%8==0){
					if(i>0) s+="</tr>";
					s+="<tr>";
				}
				s+='<td width=16 bgcolor='+a[i]+'>&nbsp;</td>';
			}
			s+="</tr></table>";
			doh.debug(s);
		}
	]);
})();

});
require(["dojox/charting/tests/Theme"]);
