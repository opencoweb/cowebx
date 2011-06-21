//
// Cooperative app 
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
				//EXERIMENTAL
				var textEditor = new TextEditor({'domNode':dojo.byId('editorNode'),id:'textEditor',go:true});
				
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