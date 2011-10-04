//
// Bootstrap file. 
//
// Copyright (c) The Dojo Foundation 2011. All Rights Reserved.
//

//App dependencies (e.g. dijit/layout/BorderContainer)
var dependencies = [
	//Global
	'org/cometd',  //*Uncomment if using Developer Setup
    'dojo',
	'dijit',
	'dojox',
	
	//App itself
	'application'
];

//Configure coweb, dojo, and requireJS
var cowebConfig = { adminUrl: '../admin' };
var dojoConfig = {
    parseOnLoad: false,
    mblAlwaysHideAddressBar: true
};
var reqConfig = {
	paths : {
        coweb : '../lib/coweb',
		cowebx: '../lib/cowebx',
        org : '../lib/org'
    },
    packages:[{
        name: 'dojo',
        location: './dojo-1.7-patched/dojo',
        main: './main',
        lib: '.'
    },
    {
        name: 'dijit',
        location:'./dojo-1.7-patched/dijit',
        main:'./main',
        lib: '.'
    },
    {
        name: 'dojox',
        location:'./dojo-1.7-patched/dojox',
        main:'./main',
        lib: '.'
    }]
};

// load the main app file
require(reqConfig,dependencies);
