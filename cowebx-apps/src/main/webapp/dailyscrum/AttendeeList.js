//
// Adds focus tracking cooperative features to a dojox.grid control. Shows
// where remote users currently have the input focus.
//
// Copyright (c) The Dojo Foundation 2011. All Rights Reserved.
// Copyright (c) IBM Corporation 2008, 2011. All Rights Reserved.
//
/*global define dojo*/
define([
    'coweb/main',
	'coweb/ext/attendance'
], function(coweb, attendance) {
    var AttendeeList = function(args) {
        this.id = args.id;
        if(!this.id) {
            throw new Error('missing id argument');
        }
		this.site = null;
        this.collab = coweb.initCollab({id : this.id});  
        this.collab.subscribeReady(this, 'onReady');
 		attendance.subscribeChange(this, 'onUserChange');   
    };
    var proto = AttendeeList.prototype;
    
    /**
     * Called when this local application instance is joined to a session and
     * has already received full state from another attendee in the session.
     * Stores the site id of this instance for later use.
     *
     * @param params Object with properties for the ready event (see doc)
     */
    proto.onReady = function(params) {
        this.site = params.site;
    };

    /**
     * Called when either local user or remote user(s) join/leave session
     * Adjusts AttendeeList entries accordingly
     *
     * @param params Object with properties for the attendance event (see doc)
     */
    proto.onUserChange = function(params) {
		//Break if empty object
		if(!params.users[0])
			return;
		if(params.type == "join"){
			//Locally create a new listItem for the user
			var a = new dojox.mobile.ListItem({ 
						innerHTML: params.users[0]['username'],
						id: params.users[0]['site'].toString()
					});
			dijit.byId('listView').addChild(a);
		}else if(params.type == "leave"){
			//Locally delete listItem for the user
			var a = dijit.byId(params.users[0]['site'].toString());
			a.destroy(false);
		}
    };
	
    return AttendeeList;
});