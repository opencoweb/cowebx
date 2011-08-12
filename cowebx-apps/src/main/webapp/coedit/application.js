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
			    //1. Create the editor
                var textEditor = new TextEditor({'domNode':dojo.byId('editorNode'),id:'textEditor',go:true});
                var button = new Button({
                    'domNode':textEditor._textarea.toolbar.domNode,
                    'listenTo':textEditor,
                    'id':'shareButton',
                    'displayButton':false});
                dojo.style(button.emailBox, 'position', 'absolute');
                dojo.style(button.emailBox, 'top', '49px');
                
			    //2. Generate session or enter session
 			    if(this.aquireUrlParams('session') == null){
 			        dojo.style('splash','display','block');
       			    dojo.connect(dojo.byId('newDoc'),'onclick',this,function(){
       			        window.location = document.URL+'?'+'session='+Math.floor(Math.random()*10000001);
       			    });
			    }else{
   			        dojo.style('editorNode','display','block');
   			        dojo.fadeIn({node:'editorNode',duration:1000}).play();
			    }
			    
			   	//4. Get a session instance & prep
			    var sess = coweb.initSession();
			    sess.prepare().then(function(info) { });
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