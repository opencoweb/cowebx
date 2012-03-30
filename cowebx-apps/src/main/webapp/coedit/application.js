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
			    //1. Generate session or enter session
                if(location.hash == ''){
                    dojo.style('splash','display','block');
                	dojo.connect(dojo.byId('newDoc'),'onclick',this,function(){
                		window.location = document.URL+'#/cowebkey/'+Math.floor(Math.random()*10000001);
                		window.location.reload();
                	});
                }else{
                    dojo.parser.parse();
                    var sess = coweb.initSession();
                	sess.prepare();
                	dojo.style('rte','display','block');
                }
			    
			}
		};
		
		dojo.ready(function() {
	        app.init();
	    });
	}
);