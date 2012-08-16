//
// Config file. Split out from the app for ease of overlaying a new config
// without affecting the app controller.
//
// Copyright (c) The Dojo Foundation 2011. All Rights Reserved.
//
var dojoConfig = {
	baseUrl: '/comap',
	async:true,
	
	paths : {
	    coweb : 'lib/coweb',
	    cowebx: 'lib/cowebx',
	    org : 'lib/org',
        comap : 'js'
	},
	
	packages:[{
		name: 'dojo',
		location:'http://ajax.googleapis.com/ajax/libs/dojo/1.8.0/dojo',
		main:'main'
	},
	{
		name: 'dijit',
		location:'http://ajax.googleapis.com/ajax/libs/dojo/1.8.0/dijit',
		main:'main'
	},
	{
		name: 'dojox',
		location:'http://ajax.googleapis.com/ajax/libs/dojo/1.8.0/dojox',
		main:'main'
	}]
};

