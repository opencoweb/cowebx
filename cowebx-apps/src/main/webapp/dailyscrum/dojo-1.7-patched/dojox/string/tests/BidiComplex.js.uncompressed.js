/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/string/BidiComplex"], function(dojo, dijit, dojox){
dojo.getObject("dojox.string.tests.BidiComplex", 1);
?/* builder delete begin
dojo.provide("dojox.string.tests.BidiComplex");

 builder delete end */
/* builder delete begin
dojo.require("dojox.string.BidiComplex");


 builder delete end */
tests.register("dojox.string.tests.BidiComplex",
	[
		{
			name: "createDisplayString: FILE_PATH",
			runTest: function(t){
				var originalString = "c:\\?????\\???.txt";
				var fixedString="?c:\\??????\\????.txt";
				var displayString = dojox.string.BidiComplex.createDisplayString(originalString, "FILE_PATH");
				t.is(displayString, fixedString);

//				originalString = "c:\\???\\???\\123\\?a";
//				fixedString="??c:\\????\\????\\123?\\?a";
//				var displayString = dojox.string.BidiComplex.createDisplayString(originalString, "FILE_PATH");
//				t.is(displayString, fixedString);
			}
		},
		{
			name: "stripSpecialCharacters: FILE_PATH",
			runTest: function(t){
				var originalString = "c:\\?????\\???.txt";
				var fixedString="?c:\\??????\\????.txt";
				var stripedString = dojox.string.BidiComplex.stripSpecialCharacters(fixedString);
				t.is(stripedString, originalString);
			}
		},
		{
			name: "createDisplayString: EMAIL",
			runTest: function(t){
				var originalString = "????@????.com";
				var fixedString="??????@?????.com";
				var displayString = dojox.string.BidiComplex.createDisplayString(originalString, "EMAIL");
				t.is(displayString, fixedString);
			}
		},
		{
			name: "stripSpecialCharacters: EMAIL",
			runTest: function(t){
				var originalString = "????@????.com";
				var fixedString="??????@?????.com";
				var stripedString = dojox.string.BidiComplex.stripSpecialCharacters(fixedString);
				t.is(stripedString, originalString);
			}
		},
		{
			name: "createDisplayString: URL",
			runTest: function(t){
				var originalString ="http://????.????.com/??????/?????????=??????&&?????=???";
				var fixedString="?http://?????.?????.com/???????/???????????=???????&&??????=???";
				var displayString = dojox.string.BidiComplex.createDisplayString(originalString, "URL");
				t.is(displayString, fixedString);
			}
		},
		{
			name: "stripSpecialCharacters: URL",
			runTest: function(t){
				var originalString ="http://????.????.com/??????/?????????=??????&&?????=???";
				var fixedString="?http://?????.?????.com/???????/???????????=???????&&??????=???";
				var stripedString = dojox.string.BidiComplex.stripSpecialCharacters(fixedString);
				t.is(stripedString, originalString);
			}
		}
		
	]
);

});
require(["dojox/string/tests/BidiComplex"]);
