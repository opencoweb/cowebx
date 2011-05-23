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
    
    proto.onReady = function(params) {
        this.site = params.site;
    };

    proto.onUserChange = function(params) {
		//Break if empty object
		if(!params.users[0])
			return;
		if(params.type == "join"){
			//Locally create a new listItem for the user
			this._userJoin(params.users);
		}else if(params.type == "leave"){
			//Locally delete listItem for the user
			this._userLeave(params.users);
		}
    };

	proto._userJoin = function(users){
		for(var i=0; i<users.length; i++){
			var a = new dojox.mobile.ListItem({ 
						innerHTML: users[i]['username'],
						id: users[i]['site'].toString()
					});
			dijit.byId('listView').addChild(a);
			dojo.connect(a.domNode, 'onclick', this, '_userClick');
		}
	};
	
	proto._userLeave = function(users){
		for(var i=0; i<users.length; i++){
			var a = dijit.byId(users[i]['site'].toString());
			a.destroy(false);
		}
	};
	
	proto._userClick = function(e){
		dijit.byId(e.target.id).select();
	};
	
    return AttendeeList;
});