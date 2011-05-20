//
// Bootstrap file. 
//
// Copyright (c) The Dojo Foundation 2011. All Rights Reserved.
//

//App dependencies (e.g. dijit/layout/BorderContainer)
var dependencies = [
	//Global
	'org/cometd',
    'dojo', 
	'dijit',
	'dojox',
	
	//App-specific
	'coweb/main',
	'dojo/parser',
	'dijit/layout/BorderContainer',
	'dijit/layout/ContentPane',
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
        location:'dojo',
        main:'./main',
        lib: '.'
    },
    {
        name: 'dijit',
        location:'dijit',
        main:'./main',
        lib: '.'
    },
    {
        name: 'dojox',
        location:'dojox',
        main:'./main',
        lib: '.'
    }]
};

// load the main app file
require(reqConfig,dependencies);
