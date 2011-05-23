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
		'dojox/mobile',
		'dojox/mobile/FixedSplitter',
		'dojox/mobile/ScrollableView',
		'AttendeeList',
		'Clock'
	],

	function(
		coweb,
		parser,
		mobile,
		FixedSplitter,
		ScrollableView,
		AttendeeList,
		Clock) {
		
		// parse declarative widgets
	   	parser.parse(dojo.body());
		
		// set up AttendanceList instance
        var attendeeList = new AttendeeList({id : 'dailyscrum_list'});

		//Set up clocks
		var userClock = new Clock({id : 'userClock', time: (1/4) });

	   	// get a session instance
	    var sess = coweb.initSession();
	    // do the prep
	    sess.prepare();
	}
);