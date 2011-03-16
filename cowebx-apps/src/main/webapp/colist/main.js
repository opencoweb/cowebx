//
// Bootstrap file. Split out from the app for ease of overlaying a new config
// without affecting the app controller.
//
// Copyright (c) The Dojo Foundation 2011. All Rights Reserved.
//
/*global require*/

// configure coweb and dojo libs before load
var cowebConfig = {adminUrl : '../admin'};
var djConfig = {
    modulePaths: {cowebx : 'dojo'},
    baseUrl : '../lib/cowebx/'
};

// load the main app file
require({
    paths : {
        coweb : '../lib/coweb',
        org : '../lib/org'
    }
}, ['colist']);
