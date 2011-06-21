//
// Cooperative text editing app 
//
// Copyright (c) The Dojo Foundation 2011. All Rights Reserved.
// 
//

define(
	//App-specific dependencies
	[
		'coweb/main',
		'dojox/mobile/parser',
		'cowebx/widgets/Editor/TextEditor'
	],

	function(
		coweb,
		parser,
		TextEditor) {
		
		var app = {
			init: function(){
			    this.clicked = false;
			    	
				//Create the editor
				var textEditor = new TextEditor({'domNode':dojo.byId('editorNode'),id:'textEditor',go:true});
				
				//Populate with some placeholder text
				textEditor._textarea.value = '\nHello, world!\n\nTry opening two browsers both pointing to this URL, or send this link to a friend, and start typing...';
				
				//Clear when clicked
				dojo.connect(textEditor._textarea, 'onclick', this, function(e){
				    if(this.clicked = false){
				        this.clicked = true;
				        e.target.value = '';
			        }
				});
				
				//Style...
				dojo.addClass(textEditor._textarea, 'shadow');
				
			   	// get a session instance & prep
			    var sess = coweb.initSession();
			    sess.prepare();
			},
		};
		
		dojo.ready(function() {
	        app.init();
	    });
	}
);