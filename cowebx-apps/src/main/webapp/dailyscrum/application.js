//
// Cooperative scrum app 
//
// Copyright (c) The Dojo Foundation 2011. All Rights Reserved.
// 
//

define(
	//App-specific dependencies
	[
	    'dojo',
		'coweb/main',
		'dojox/mobile/parser',
		'Clock',
		'AttendeeList',
		'cowebx/dojo/Editor/TextEditor',
		'dojo/fx',
		'dojox/mobile',
		'dojox/mobile/FixedSplitter',
		'dojox/mobile/ScrollableView'
	],

	function(
	    dojo,
		coweb,
		parser,
		Clock,
		AttendeeList,
		TextEditor) {
		
		var app = {
			init: function(){			
				this.parseInviteList();
			   	parser.parse(dojo.body());
				this.buildClocks();
				this.buildEditor();
				this.attendeeList = new AttendeeList({id : 'dailyscrum_list', override: this.override});
				this.mods = [];
				this.override = false;
				
				this.connectEvents();
				this.connectSyncs();
				
				//Clock prep
				this.meetingTime = this._length*60;
				this.meetingTimeTaken = 0;
				this.userCount = 0;
				this.users = {};
				this.currentSpeakerTime = 0;
				
			   	//Session prep
			    var sess = coweb.initSession();
			    sess.prepare();
			},
			
			connectSyncs: function(){
				this.collab = coweb.initCollab({id : 'dailyscrum'});  
				this.collab.subscribeStateRequest(this, 'onStateRequest');
				this.collab.subscribeStateResponse(this, 'onStateResponse');
				this.collab.subscribeSync('meetingStop', this, 'onRemoteStopMeeting');	
			},
			
			connectEvents: function(){
				dojo.connect(this.attendeeList, '_onUserClick', this, 'onUserClick');
				dojo.connect(this.attendeeList, '_onRemoteUserClick', this, 'onUserClick');
				dojo.connect(this.attendeeList, '_onActivateUser', this, 'onActivateUser');
				dojo.connect(this.attendeeList, '_onActivateRemoteUser', this, 'onActivateRemoteUser');
				dojo.connect(this.attendeeList, '_deactivateUser', this, 'onDectivateUser');
				dojo.connect(dijit.byId('scrumFrameView'),'resize',this,'_ffResize');
				dojo.connect(dojo.byId('start'),'onclick',this,'stopMeeting');
				dojo.connect(document, 'onkeyup', this, 'keyUp');
				dojo.connect(document, 'onkeydown', this, 'keyDown');
			},
			
			buildEditor: function(){
				this.textEditor = new TextEditor({'domNode':dojo.byId('editorNode'),id:'textEditor',go:true});
				dojo.style(this.textEditor._textarea, 'border', '0px');
				dojo.style(this.textEditor._textarea, 'margin', '0px');
				dojo.style(this.textEditor._textarea, 'resize', 'none');
				dojo.style(this.textEditor._textarea, 'padding', '5px');
			},
			
			buildClocks: function(){
				this._length = (this.aquireUrlParams('length') != null) ? this.aquireUrlParams('length') : 10;
				this.totalClock = new Clock({id : 'totalClock', type : 'total', time: this._length });
				this.userClock = new Clock({id : 'userClock', type : 'user', time: 0 });
				this.t = new dojox.timing.Timer(1000);
				this.t.status = 'stopped';
				dojo.connect(this.t, 'onTick', this, '_onTick');
			},
			
			parseInviteList: function(){
				var inviteList = (this.aquireUrlParams('invites') != null) ? this.aquireUrlParams('invites') : null;
				if(inviteList != null){
					this.invites = dojo.xhrGet({
						url: inviteList,
						handleAs: 'json',
						load: dojo.hitch(this, function(data){ 
							this.populateExpectedList(data);  
							this.mode = 'json'
						}),
						error: function(error) { console.log(error); }
					});
				}else{
				    this.override = true;
				}
			},
			
			populateExpectedList: function(inviteObj){
				this.attendeeList.inviteList = inviteObj;
				for(var user in inviteObj){
				    if(inviteObj[user] == true)
				        this.mods.push(user);
					var a = this.attendeeList._createInactiveUser(user);	
					dojo.connect(a.domNode, 'ondblclick', this, function(e){
						if(dojo.attr(e.target, 'active') == false){
							var name = e.target.id.substring(0, e.target.id.length-3);
							this.attendeeList.onActivateUser(name, true);
						}
					});
				}
				this.attendeeList.mods = this.mods;
				this.totalClock.mods = this.mods;
				this.userClock.mods = this.mods;
			},
			
			onActivateUser: function(e){
			    if(this.users[e] != null){
					var user = this.users[e];
				}else{
					this.users[e] = {};
					var user = this.users[e];
				}
				user["present"] = true;
				user["timeTaken"] = (user["timeTaken"] == undefined) ? 0 : user["timeTaken"];
				user["count"] = (user["count"] == undefined) ? 1 : user["count"]+1;
				this.userCount++;

				//Adjust user clock
				var selected = this.attendeeList.selected;
				if(selected != null){
					this.userClock.seconds = this.getUserTimeRemaining(selected);
					dijit.byId(this.attendeeList.selected+'_li').select();
				}

				dojo.attr(e+'_count', 'innerHTML',this._renderTime(this.users[e].timeTaken));
				return user;
			},
			
			onActivateRemoteUser: function(obj){
				var e = obj.value.activatedName;
				if(obj.byClick == true){
					if(this.users[e] != null){
						var user = this.users[e];
					}else{
						this.users[e] = {};
						var user = this.users[e];
					}
					user["present"] = true;
					user["timeTaken"] = (user["timeTaken"] == undefined) ? 0 : user["timeTaken"];
					this.userCount++;
			
					//Adjust user clock
					var selected = this.attendeeList.selected;
					if(selected != null){
						this.userClock.seconds = this.getUserTimeRemaining(selected);
						dijit.byId(this.attendeeList.selected+'_li').select();
					}
					return user;
				}
			},
			
			onDectivateUser: function(e){
			    console.log('deactivate');
				var user = this.users[e];
				user['present'] = false;
				this.userCount--;
				
				//Adjust user clock
				var selected = this.attendeeList.selected;
				if(selected != null){
					this.userClock.seconds = this.getUserTimeRemaining(selected);
					if(e == selected){
						this.userClock.stop();
						this.userClock.seconds = 0;
						this.userClock._renderTime();
						this.t.stop();
					}
				}
				
				return user
			},
			
			onUserClick: function(){
				var selected = this.attendeeList.selected;
				var prevSelected = this.attendeeList.prevSelected;
				//If we select someone new, restart the duration timer
				if((selected != prevSelected)){
					this.totalClock.stop();
					this.userClock.stop();
					this.t.stop();
					this.userClock.seconds = this.getUserTimeRemaining(selected);
					dojo.attr('speaker','innerHTML','Current Speaker: '+selected);
					if(this.userClock.seconds < 0){
						this.userClock.test = 'neg';
						this.userClock.notify();
						this.userClock.seconds = Math.abs(this.userClock.seconds);
					}else if(this.userClock.seconds >= 0){
						this.userClock.test = 'pos';
						this.userClock.unNotify();
					}
					this.totalClock.start();
					this.userClock.start();
					this.t.start();
					this.t.status = 'started';
				}
				dojo.style('start','display','inline');
			},
			
			onStateRequest: function(token){
				var state = {
					meetingTime : this.meetingTime,
					meetingTimeTaken : this.meetingTimeTaken,
					users : this.users,
					
					userClockStatus : this.userClock.status,
					totalClockStatus : this.totalClock.status,
					tStatus : this.t.status,
					
					selected : this.attendeeList.selected,
					prevSelected : this.attendeeList.prevSelected
				};
				this.collab.sendStateResponse(state, token);
			},
			
			onStateResponse: function(state){
			    console.log("state response");
				this.meetingTime = state.meetingTime;
				this.meetingTimeTaken = state.meetingTimeTaken;
				this.users = state.users;
				
				this.totalClock.status = state.totalClockStatus;
				this.userClock.status = state.userClockStatus;
				this.t.status = state.tStatus;
				
				this.attendeeList.selected = state.selected;
				this.attendeeList.prevSelected = state.prevSelected;
				
				if(this.totalClock.status == 'started'){
					this.totalClock.seconds = this.getMeetingTimeRemaining();
					this.totalClock.start();
				}
				
				if(this.userClock.status == 'started'){
					this.userClock.start();
				}
				
				if(this.t.status == 'started'){
					this.t.start();
				}
			},
			
			talkFor: function(e, seconds){
				user = this.users[e];
				user['timeTaken'] += seconds;
				this.meetingTimeTaken += seconds;
			},
			
			getInactiveTimeTaken: function(){
				var sum = 0;
				for(var i in this.users){
					if(this.users[i]['present'] == false)
						sum = sum + this.users[i]['timeTaken'];
				}
				return sum;
			},
			
			getUserTimeRemaining: function(e){
				var user = this.users[e]
				return this.getUserTimeScheduled() - user['timeTaken'];
			},
			
			getUserTimeScheduled: function(e){
				var ms = (this.meetingTime - this.getInactiveTimeTaken()) / this.userCount;
				return Math.round(ms);
			},
			
			getMeetingTimeRemaining: function(){
				return this.meetingTime - this.meetingTimeTaken;
			},
			
			aquireUrlParams: function(param){
				param = param.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
				var pattern = "[\\?&]"+param+"=([^&#]*)";
				var regex = new RegExp( pattern );
				var results = regex.exec( window.location.href );
				if( results == null )
					return null;
				else
					return results[1];
			},
			
			_ffResize: function(e){
				var height = dijit.byId('container').domNode.clientHeight-150;
				dojo.style(dijit.byId('scrumFrameView').domNode,'height',height+"px");
			},
			
			_onTick: function(){
				this.talkFor(this.attendeeList.selected, 1);
				var time = this.users[this.attendeeList.selected].timeTaken;
				var formattedTime = this._renderTime(time);
				dojo.attr(this.attendeeList.selected+'_count','innerHTML',formattedTime);
			},
			
			_renderTime: function(n){
				var min = Math.floor(n/60);
				if(min < 10)
					min = "0"+min;
				var secs = n%60;
				if(secs<10)
					secs = "0"+secs;
				return(min + ":" + secs);
			},
			
			keyUp: function(e){
				if(e.which == 17) 
					this._isCtrl=false;
			},
			
			keyDown: function(e){
				if(e.which == 17) 
					this._isCtrl=true;
				//Right 
				if(e.which == 39 && this._isCtrl == true) { 
					var check = false;
					var stop = false;
					dojo.query('#listView li').forEach(dojo.hitch(this, function(node, index, arr){
						if(dojo.attr(node, 'active') != false){
							if(check == true && stop == false){
								var e = {target:{id:node.id}};
								this.attendeeList.onUserClick(e);
								stop = true;
							}
							if(dijit.byId(node.id).selected == true)
								check = true;
						}
					}));
				//Left
				}else if(e.which == 37 && this._isCtrl == true) { 
					var prev = null;
					var stop = false;
					dojo.query('#listView li').forEach(dojo.hitch(this, function(node, index, arr){
						if(dojo.attr(node, 'active') != false){
							if(dijit.byId(node.id).selected == true && stop == false){
								if(prev != null){ 
									var e = {target:{id:prev}};
									this.attendeeList.onUserClick(e);
								}
								stop = true;
							}else if(stop == false){
								prev = node.id;
							}
						}
					}));
				}
			},
			
			stopMeeting: function(){
			    console.log(this.mods.indexOf(this.attendeeList.local));
			    console.log(this.override);
			    if(this.mods.indexOf(this.attendeeList.local) != -1 || this.override == true){
			        this.totalClock.stop();
    			    this.userClock.stop();
    			    this.t.stop();
                    this.attendeeList.selected = null;
                    dojo.style('start','display','none');
                    this.collab.sendSync('meetingStop', { }, null);
                }
			},
			
			onRemoteStopMeeting: function(){
		        this.totalClock.stop();
			    this.userClock.stop();
			    this.t.stop();
                this.attendeeList.selected = null;
                dojo.style('start','display','none');
                this.collab.sendSync('meetingStop', { }, null);
			},
		};
		
		dojo.ready(function() {
	        app.init();
	    });
	}
);