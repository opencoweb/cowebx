//
// Cooperative text editing app 
//
// Copyright (c) The Dojo Foundation 2011. All Rights Reserved.
// 

define(
	//App-specific dependencies
	[
	    'dojo',
		'coweb/main',
		'dojox/mobile/parser',
		'cowebx/dojo/RichTextEditor/RichTextEditor',
	],

	function(
	    dojo,
		coweb,
		parser,
		RichTextEditor) {
		
		var app = {
			init: function(){
			    dojo.parser.parse();
			}
		};
		
		dojo.ready(function() {
	        app.init();
	    });
	}
);