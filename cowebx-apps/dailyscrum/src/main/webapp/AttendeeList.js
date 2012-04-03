//
// Attendee List with collab using coweb attendance api
//
// Copyright (c) The Dojo Foundation 2011. All Rights Reserved.
//

define([
    'dojo',
    'dijit/registry',
    'coweb/main',
    'dojox/mobile/ListItem',
	'coweb/ext/attendance'
], function(dojo, dijit, coweb, ListItem, attendance) {
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
		this.phoneUsers = {};			//active phone user list
		this.users = {};                //active user list
		this.handles = {};              //dojo.connect handles for disconnect
		this.mods = [];                 //Array of mod names
		this.local = null;              //the local username
		this.ready = false;             //onReady?
		this.queue = [];                //queue for joiners if not ready
		
		this.override = (!args.override) ? false : args.override;
		
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
        this.ready = true;
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

	proto.onUserClick = function(e){
	    if(this.mods.indexOf(this.local) != -1 || this.override == true){
    		if(dojo.byId(e.target.id) != null){
    			dijit.byId(e.target.id).select();
    			dijit.byId(e.target.id).selected = true;
    			this.collab.sendSync('userClick', { selectedId: e.target.id }, null);
    			this.prevSelected = this.selected;
    			if(dijit.byId(this.prevSelected+"_li"))
    				dijit.byId(this.prevSelected+"_li").selected = false;
    			this.selected = e.target.id.substring(0,e.target.id.length-3);
    			this._onUserClick(e);
    		}
    	}
	};	
	
	proto.onRemoteUserClick = function(obj){
		dijit.byId(obj.value.selectedId).select();
		dijit.byId(obj.value.selectedId).selected = true;
		this.prevSelected = this.selected;
		if(dijit.byId(this.prevSelected+"_li"))
			dijit.byId(this.prevSelected+"_li").selected = false;
		this.selected = obj.value.selectedId.substring(0,obj.value.selectedId.length-3);
		this._onRemoteUserClick(obj);
	};
	
	proto.onActivateRemoteUser = function(obj){
		if(dojo.attr(obj.value.activatedName+"_li", 'active') != true){
			this.count++;
			if(obj.value.clicked){
			    this.phoneUsers[obj.value.activatedName] = true;
			    if(this.users[obj.value.activatedName] == null){
    		        this.users[obj.value.activatedName] = 1;
    		    }
			}
			dojo.toggleClass(obj.value.activatedName+"_li", "dailyscrum_inactive");
			dojo.attr(obj.value.activatedName+"_li", 'active', true);
			this.handles[obj.value.activatedName] = dojo.connect(dijit.byId(obj.value.activatedName+'_li').domNode,'onclick',this,'onUserClick');	
			obj["byClick"] = true;
		    this._onActivateRemoteUser(obj);
		}
		
	};
	
	proto.onActivateUser = function(name, click){
	    if(((this.mods.indexOf(this.local) != -1) || this.override == true) || (click == undefined)){
		    if(dojo.attr(name+"_li", 'active') != true){
    			this.count++;
    			if(click){
    			    this.phoneUsers[name] = true;
    			    if(this.users[name] == null){
        		        this.users[name] = 1;
        		    }
    			}
    			dojo.toggleClass(name+"_li", "dailyscrum_inactive");
    			dojo.attr(name+"_li", 'active', true);
    			this.handles[name] = dojo.connect(dijit.byId(name+'_li').domNode,'onclick',this,'onUserClick');
    			
    			this.collab.sendSync('userActivate', { 
    			    activatedName: name ,
    			    clicked: click
    			}, null);

    		    this._onActivateUser(name);
    		}
		}
	};
	
	proto._deactivateUser = function(name){
		if(dojo.attr(name+"_li", 'active') != false){
			this.count--;
			dojo.toggleClass(name+"_li", "dailyscrum_inactive");
			dojo.attr(name+"_li", 'active', false);
			dojo.disconnect(this.handles[name]);
			delete this.handles[name];
		}
	};
	
	proto.onStateRequest = function(token){
		var state = {
			phoneUsers : this.phoneUsers,
			selected : this.selected
		};
		this.collab.sendStateResponse(state,token);
	};
	
	proto.onStateResponse = function(state){
		this.phoneUsers = state.phoneUsers;
		for(var i in this.phoneUsers){
		    this._userJoin([{username: i, local: false}]);
		}
	};

	proto._userJoin = function(users){
		//dojo.style(a.domNode, 'color', 'orange');
		for(var i=0; i<users.length; i++){
		    if(this.users[users[i]['username']] == null){
		        this.users[users[i]['username']] = 1;
    			var found = false;
    			for(var j in this.inviteList){
    				if(users[i]['username'] == j){
    					this.onActivateUser(j);
    					found = true;
    					if(users[i]["local"] == true){
    						dojo.style(dijit.byId(users[i]['username']+'_li').domNode, 'color', 'orange');
    						this.local = users[i]['username'];
    					}
    				}
    			}
    			if(found == false){
    				this._createInactiveUser(users[i]['username'], users[i]["local"]);
    				this.onActivateUser(users[i]['username']);
    			}
    		}else{
    		    this.users[users[i]['username']] = this.users[users[i]['username']] + 1;
    		}
		}
	};
	
	proto._userLeave = function(users){
		for(var i=0; i<users.length; i++){
		    if(this.users[users[i]['username']] == 1){
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
    			if(dijit.byId(users[i]['username']+"_li"))
    			    dijit.byId(users[i]['username']+"_li").deselect();
    			    
    			delete this.users[users[i]['username']];
    			
    			if(this.phoneUsers[users[i]['username']])
    			    delete this.phoneUsers[users[i]['username']];
    			    
    			if(this.selected == users[i]['username'])
    			    this.selected = null;
    		}else{
    		    this.users[users[i]['username']] = this.users[users[i]['username']] - 1;
    		}
		}
	};
	
	proto._createInactiveUser = function(name, local){
		var a = new ListItem({ 
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
	
	proto._onUserClick = function(name){
	    
	};
	
    return AttendeeList;
});