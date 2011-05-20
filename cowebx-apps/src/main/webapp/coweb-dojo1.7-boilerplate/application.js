//
// Cooperative app 
//
// Copyright (c) The Dojo Foundation 2011. All Rights Reserved.
// Copyright (c) IBM Corporation 2008, 2011. All Rights Reserved.
//

define(
	//App-specific dependencies
	[
		'coweb/main',
		'dojo/parser',
		'dijit/layout/BorderContainer',
		'dijit/layout/ContentPane'
	],

	function(
		coweb,
		parser,
		BorderContainer,
		ContentPane) {
		
		// parse declarative widgets
	   	parser.parse(dojo.body());

	   	// get a session instance
	    var sess = coweb.initSession();
	    // do the prep
	    sess.prepare();
	}
);