define([
    'coweb/main',
	'coweb/ext/attendance'
], function(coweb, attendance) {
    var AttendeeList = function(args) {
		//Params
		this.site = null;
        this.id = args.id;
        if(!this.id)
            throw new Error('missing id argument');
			
		//List vars
		this.count = null;				//How many users currently
		this.clicked = false;			//Has a speaker been chosen yet?
		this.selected = 'None';			//Currently selected username
		this.selectedId = null;			//Currently selectd ID
		this.prevSelectedId = null;		//Previously selected ID
		
		//Subscribe to syncs and listen
        this.collab = coweb.initCollab({id : this.id});  
        this.collab.subscribeReady(this, 'onReady');
 		attendance.subscribeChange(this, 'onUserChange');
    };
    var proto = AttendeeList.prototype;
    
    proto.onReady = function(params) {
        this.site = params.site;
    };

    proto.onUserChange = function(params) {
		this.count = params.count;
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
						id: users[i]['site'].toString(),
					});
			dijit.byId('listView').addChild(a);
			var b = dojo.create("span", { 
						id: users[i]['site'].toString()+"_count",
						innerHTML: '00:00',
						'class':'dailyscrum_count'
					}, a.domNode, 'last');
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
		this.selectedId = e.target.id;
		dijit.byId(e.target.id).select();
	};
	
    return AttendeeList;
});