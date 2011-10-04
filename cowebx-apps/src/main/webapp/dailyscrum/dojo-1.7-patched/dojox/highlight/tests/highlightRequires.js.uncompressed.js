/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/highlight/widget/Code","dojox/highlight/languages/xml","dojox/highlight/languages/pygments/xml","dojox/highlight/languages/java","dojox/highlight/languages/xquery"], function(dojo, dijit, dojox){
dojo.getObject("dojox.highlight.tests.highlightRequires", 1);
// Load Code formatting widget (supports line numbering, alternating line highlighting, line ranges and loading from remote url):
/* builder delete begin
dojo.require("dojox.highlight.widget.Code");

 builder delete end */
// Load the languages and pygment renderers for the languages we're displaying...
/* builder delete begin
dojo.require("dojox.highlight.languages.xml");

 builder delete end */
/* builder delete begin
dojo.require("dojox.highlight.languages.pygments.xml");

 builder delete end */
/* builder delete begin
dojo.require("dojox.highlight.languages.java");

 builder delete end */
/* builder delete begin
dojo.require("dojox.highlight.languages.xquery");
 builder delete end */

});
require(["dojox/highlight/tests/highlightRequires"]);
