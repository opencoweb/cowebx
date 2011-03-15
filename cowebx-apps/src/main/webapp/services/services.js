//
// Service bot test page.
//
// Copyright (c) The Dojo Foundation 2011. All Rights Reserved.
// Copyright (c) IBM Corporation 2008, 2011. All Rights Reserved.
//
/*global require*/
// configure coweb lib before load
var cowebConfig = {
    adminUrl : '../admin'
};

var echo1, echo2, getTime1, getTime2;
require({baseUrl : '../lib'}, [
    'coweb/main'
], function(coweb) {
    /* Logs info about a response to a bot request. */
    var _onBotResponse = function(serviceName, id, args) {
        console.log(serviceName, 'responded to collab.id:', id, 'value:', 
            args.value, 'error:', args.error);
    };

    /* Logs info about a message published to all users by a bot. */
    var _onBotPublish = function(serviceName, id, args) {
        console.log(serviceName, 'published to collab.id:', id, 'value:', 
            args.value, 'error:', args.error);
    };

    /* Builds a function that invokes the echo bot using the given collab API
     * instance. 
     */
    var _makeEchoFunc = function(collab) {
        return function(text) {
            collab.postService('echo', {message : text}, function(args) {
                _onBotResponse('echo', collab.id, args);
            });
        };
    };

    /* Builds a function that invokes the utctime bot using the given collab API
     * instance. 
     */
    var _makeTimeFunc = function(collab) {
        return function() {
            collab.postService('utctime', {}, function(args) {
                _onBotResponse('utctime', collab.id, args);
            });
        };
    };

    /* Subscribes the collab instances to the echo and utctime services. */
    var _onCollabReady = function(collab) {
        // listen on both interfaces to echo service
        collab.subscribeService('echo', function(args) {
            _onBotPublish('echo', collab.id, args);
        });
        collab.subscribeService('utctime', function(args) {
            _onBotPublish('utctime', collab.id, args);
        });
    };

    require.ready(function() {
        // build a couple collab interfaces
        var collab1 = coweb.initCollab({id : 'collab1'});
        collab1.subscribeReady(function() {
            _onCollabReady(collab1);
        });
        var collab2 = coweb.initCollab({id : 'collab2'});
        collab2.subscribeReady(function() {
            _onCollabReady(collab2);
        });         
        
        // build funcs for use at the console
        echo1 = _makeEchoFunc(collab1);
        echo2 = _makeEchoFunc(collab2);
        getTime1 = _makeTimeFunc(collab1);
        getTime2 = _makeTimeFunc(collab2);
        
        // initialize a session
        var sess = coweb.initSession();
        // no user to user events needed, just bot traffic
        var prep = {collab: false};
        sess.prepare(prep);
    });
});