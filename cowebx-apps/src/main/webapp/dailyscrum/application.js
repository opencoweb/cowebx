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
		'dojox/mobile/parser',
		'dijit/layout/BorderContainer',
		'dijit/layout/ContentPane',
		'dojox/mobile',
		'dojox/mobile/FixedSplitter',
		'dojox/mobile/ScrollableView',
		'AttendeeList'
	],

	function(
		coweb,
		parser,
		BorderContainer,
		ContentPane,
		mobile,
		FixedSplitter,
		ScrollableView,
		AttendeeList) {
		
		// parse declarative widgets
	   	parser.parse(dojo.body());
		
		// set up AttendanceList instance
		args = {id : 'dailyscrum_list'};
        var attendeeList = new AttendeeList(args);

	   	// get a session instance
	    var sess = coweb.initSession();
	    // do the prep
	    sess.prepare();
	}
);