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
		//'cowebx/dojo/BasicTextareaEditor/TextEditor',
		'cowebx/dojo/RichTextEditor/TextEditor',
		'cowebx/dojo/ShareButton/Button'
	],

	function(
	    dojo,
		coweb,
		parser,
		TextEditor,
		Button) {
		
		var app = {
			init: function(){
			    this.clicked = false;
			    	
				//1. Create the editor
				var textEditor = new TextEditor({'domNode':dojo.byId('editorNode'),id:'textEditor',go:true});
                var button = new Button({'domNode':textEditor.getNode(),'listenTo':textEditor,'id':'shareButton'});
                                dojo.style(button.shareButton, 'float', 'right');
                                dojo.style(button.shareButton, 'top', '7px');
                                dojo.style(button.shareButton, 'left', '45px');
                                dojo.style(button.emailBox, 'float', 'right');
                                dojo.style(button.emailBox, 'top', '0px');
                                dojo.style(button.emailBox, 'left', '55px');
				//dojo.style(textEditor.getNode(), 'height', '90%');
				
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