//
// Cooperative text editing app 
//
// Copyright (c) The Dojo Foundation 2011. All Rights Reserved.
// 
//

define(
	//App-specific dependencies
	[
	    'dojo',
		'coweb/main',
		'dojox/mobile/parser',
		'cowebx/dojo/Editor/TextEditor'
	],

	function(
	    dojo,
		coweb,
		parser,
		TextEditor) {
		
		var app = {
			init: function(){
			    this.clicked = false;
			    	
				//1. Create the editor
				var textEditor = new TextEditor({'domNode':dojo.byId('editorNode'),id:'textEditor',go:true});
				
				//2. Populate with some placeholder text and style
				//textEditor._textarea.value = 'Hello, world!\n\nTry opening two browsers both pointing to this URL, or send this link to a friend, and start typing...';
				
			   	//3. Get a session instance & prep
			    var sess = coweb.initSession();
			    sess.prepare();
			},
		};
		
		dojo.ready(function() {
	        app.init();
	    });
	}
);