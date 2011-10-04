/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/highlight/_base"],function(_1,_2,_3){_1.getObject("dojox.highlight.languages.xml",1);(function(){var _4={className:"comment",begin:"<!--",end:"-->"};var _5={className:"attribute",begin:" [a-zA-Z-]+\\s*=\\s*",end:"^",contains:["value"]};var _6={className:"value",begin:"\"",end:"\""};var dh=_3.highlight,_7=dh.constants;dh.languages.xml={defaultMode:{contains:["pi","comment","cdata","tag"]},case_insensitive:true,modes:[{className:"pi",begin:"<\\?",end:"\\?>",relevance:10},_4,{className:"cdata",begin:"<\\!\\[CDATA\\[",end:"\\]\\]>"},{className:"tag",begin:"</?",end:">",contains:["title","tag_internal"],relevance:1.5},{className:"title",begin:"[A-Za-z:_][A-Za-z0-9\\._:-]+",end:"^",relevance:0},{className:"tag_internal",begin:"^",endsWithParent:true,contains:["attribute"],relevance:0,illegal:"[\\+\\.]"},_5,_6],XML_COMMENT:_4,XML_ATTR:_5,XML_VALUE:_6};})();});require(["dojox/highlight/languages/xml"]);