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
		this.count = null;				//How many active users
		this.inviteList = null;			//User invite list
		this.selected = null;			//Selected user name
		this.prevSelected = null;		//Previously selectd user name
		this.phoneUsers = {};			//active user list
		
		//Subscribe to syncs and listen
        this.collab = coweb.initCollab({id : this.id});  
        this.collab.subscribeReady(this, 'onReady');
 		attendance.subscribeChange(this, 'onUserChange');
		this.collab.subscribeSync('userActivate', this, 'onActivateRemoteUser');
		this.collab.subscribeSync('userClick', this, 'onRemoteUserClick');
		this.collab.subscribeStateRequest(this, 'onStateRequest');
		this.collab.subscribeStateResponse(this, 'onStateResponse');
    };
    var proto = AttendeeList.prototype;
    
    proto.onReady = function(params) {
        this.site = params.site;
    };

    proto.onUserChange = function(params) {
		console.log('change');
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

	proto.onUserClick = function(e){
		if(dojo.byId(e.target.id) != null){
			dijit.byId(e.target.id).select();
			this.collab.sendSync('userClick', { selectedId: e.target.id }, null);
			this.prevSelected = this.selected;
			this.selected = e.target.id.substring(0,e.target.id.length-3);
		}
	};	
	
	proto.onRemoteUserClick = function(obj){
		dijit.byId(obj.value.selectedId).select();
		this.prevSelected = this.selected;
		this.selected = obj.value.selectedId.substring(0,obj.value.selectedId.length-3);
		this._onRemoteUserClick(obj);
	};
	
	proto.onActivateRemoteUser = function(obj){
		if(dojo.attr(obj.value.activatedName+"_li", 'active') != true){
			this.count++;
			this.phoneUsers[obj.value.activatedName] = true;
			dojo.toggleClass(obj.value.activatedName+"_li", "dailyscrum_inactive");
			dojo.attr(obj.value.activatedName+"_li", 'active', true);
			dojo.connect(dijit.byId(obj.value.activatedName+'_li').domNode,'onclick',this,'onUserClick');	
			obj["byClick"] = true;
		}
		this._onActivateRemoteUser(obj);
	};
	
	proto.onActivateUser = function(name){
		if(dojo.attr(name+"_li", 'active') != true){
			this.count++;
			this.phoneUsers[name] = true;
			dojo.toggleClass(name+"_li", "dailyscrum_inactive");
			dojo.attr(name+"_li", 'active', true);
			dojo.connect(dijit.byId(name+'_li').domNode,'onclick',this,'onUserClick');
			this.collab.sendSync('userActivate', { activatedName: name }, null);	
		}
		this._onActivateUser(name);	
	};
	
	proto.onStateRequest = function(token){
		var state = {
			phoneUsers : this.phoneUsers,
			selected : this.selected
		};
		this.collab.sendStateResponse(state,token);
	};
	
	proto.onStateResponse = function(state){
		
	};

	proto._userJoin = function(users){
		//dojo.style(a.domNode, 'color', 'orange');
		for(var i=0; i<users.length; i++){
			var found = false;
			for(var j in this.inviteList){
				if(users[i]['username'] == j){
					this.onActivateUser(j);
					found = true;
					if(users[i]["local"] == true)
						dojo.style(dijit.byId(users[i]['username']+'_li').domNode, 'color', 'orange');
				}
			}
			if(found == false){
				this._createInactiveUser(users[i]['username'], users[i]["local"]);
				this.onActivateUser(users[i]['username']);
			}
		}
	};
	
	proto._createInactiveUser = function(name, local){
		var a = new dojox.mobile.ListItem({ 
					innerHTML: name,
					id: name+"_li",
					'class':'dailyscrum_inactive'
				});
		dojo.attr(a.domNode, 'active', false);
		dijit.byId('listView').addChild(a);
		var b = dojo.create("span", { 
					innerHTML: '00:00',
					id: name+"_count",
					'class':'dailyscrum_count'
				}, a.domNode, 'last');
		if(local == true)
			dojo.style(a.domNode, 'color', 'orange');
		return a;
	};
	
	proto._onActivateUser = function(name){

	};
	
	proto._onActivateRemoteUser = function(obj){
		
	};
	
	proto._onRemoteUserClick = function(obj){
		
	};
	
	proto._deactivateUser = function(name){
		if(dojo.attr(name+"_li", 'active') != false){
			this.count--;
			dojo.toggleClass(name+"_li", "dailyscrum_inactive");
			dojo.attr(name+"_li", 'active', false);
		}
	};
	
	proto._userLeave = function(users){
		for(var i=0; i<users.length; i++){
			var found = false
			this._deactivateUser(users[i]['username']);
			for(var j in this.inviteList){
				if(users[i]['username'] == j){
					found = true;
				}
			}
			if(found == false){
				var li = dijit.byId(users[i]['username']+"_li");
				li.destroy(false);
			}
		}
	};
	
    return AttendeeList;
});