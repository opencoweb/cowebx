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
		this.count = null;
		this.clicked = false;
		this.selected = 'None';
		
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
		this.count = params.count;
		console.log("count = "+this.count);
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
		this.clicked = true;
		this.selected = e.target.innerHTML;
		dijit.byId(e.target.id).select();
	};
	
    return AttendeeList;
});