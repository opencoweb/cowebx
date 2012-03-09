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
		'cowebx/dojo/RichTextEditor/TextEditor',
	],

	function(
	    dojo,
		coweb,
		parser,
		TextEditor) {
		
		var app = {
			init: function(){
			    dojo.parser.parse();

			    //1. Generate session or enter session
 			    if(location.hash == ''){
 			        	dojo.style('splash','display','block');
 			        	console.log("hashtag = "+location.hash);
	       			dojo.connect(dojo.byId('newDoc'),'onclick',this,function(){
	       				window.location = document.URL+'#/cowebkey/'+Math.floor(Math.random()*10000001);
	       				window.location.reload();
	       			});
			    }else{
	        	    		var sess = coweb.initSession();
    			    	sess.prepare().then(function(info) { });
   			        	dojo.style('editorNode','display','block');
   			        	dojo.fadeIn({node:'editorNode',duration:1000}).play();
			    }
			},
			
			aquireUrlParams: function(param){
				param = param.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
				var pattern = "[\\?&]"+param+"=([^&#]*)";
				var regex = new RegExp( pattern );
				var results = regex.exec( window.location.href );
				if( results == null )
					return null;
				else
					return results[1];
			}
		};
		
		dojo.ready(function() {
	        app.init();
	    });
	}
);