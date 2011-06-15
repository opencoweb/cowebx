//
// Cooperative app 
//
// Copyright (c) The Dojo Foundation 2011. All Rights Reserved.
// 
//

define(
	//App-specific dependencies
	[
		'coweb/main',
		'dojox/mobile/parser',
		'Clock',
		'AttendeeList',
		'TextEditor',
		'dojo/fx',
		'dojox/mobile',
		'dojox/mobile/FixedSplitter',
		'dojox/mobile/ScrollableView'
	],

	function(
		coweb,
		parser,
		Clock,
		AttendeeList,
		TextEditor) {
		
		var app = {
			init: function(){			
				//Parse the invite list
				var inviteList = (this.aquireUrlParams('invites') != null) ? this.aquireUrlParams('invites') : null;
				if(inviteList != null){
					this.invites = dojo.xhrGet({
						url: 'invites.json',
						handleAs: 'json',
						load: dojo.hitch(this, function(data){ 
							this.populateExpectedList(data);  
							this.mode = 'json'
						}),
						error: function(error) { console.log(error); }
					});
				}
				
				
				//Parse declarative widgets
			   	parser.parse(dojo.body());
				
				//Set up clocks (User, Total, and durationTimer)
				var length = (this.aquireUrlParams('length') != null) ? this.aquireUrlParams('length') : 10;
				this.totalClock = new Clock({id : 'totalClock', type : 'total', time: length });
				this.userClock = new Clock({id : 'userClock', type : 'user', time: 0 });
				this.t = new dojox.timing.Timer(1000);
				this.t.status = 'stopped';
				dojo.connect(this.t, 'onTick', this, '_onTick');
				
				//Set up attendeeList & connect list activation to local func
				this.attendeeList = new AttendeeList({id : 'dailyscrum_list'});
				
				//Setup iFrame
				var hide = (this.aquireUrlParams('hideUrl') != null) ? this.aquireUrlParams('hideUrl') : 'no';
				if(hide == 'yes'){
					dojo.style('urlBar', 'display', 'none');
					dojo.style('urlSubmit', 'display', 'none');
				}
				var url = (this.aquireUrlParams('url') != null) ? this.aquireUrlParams('url') : '';
				dojo.attr('scrumFrame','src', url);
				
				//Connect to events
				dojo.connect(this.attendeeList, 'onUserClick', this, 'onUserClick');
				dojo.connect(this.attendeeList, '_onRemoteUserClick', this, 'onUserClick');
				dojo.connect(this.attendeeList, '_onActivateUser', this, 'onActivateUser');
				dojo.connect(this.attendeeList, '_onActivateRemoteUser', this, 'onActivateRemoteUser');
				dojo.connect(this.attendeeList, '_deactivateUser', this, 'onDectivateUser');
				dojo.connect(dijit.byId('scrumFrameView'),'resize',this,'_ffResize');
				
				//Sync
				this.collab = coweb.initCollab({id : 'dailyscrum'});  
				this.collab.subscribeStateRequest(this, 'onStateRequest');
				this.collab.subscribeStateResponse(this, 'onStateResponse');
				
				//CLOCK
				this.meetingTime = length*60;
				this.meetingTimeTaken = 0;
				this.userCount = 0;
				this.users = {};
				this.currentSpeakerTime = 0;
				
				//EXERIMENTAL
				var textEditor = new TextEditor({'domNode':dojo.byId('editorNode'),id:'textEditor',go:true});
				
			   	// get a session instance & prep
			    var sess = coweb.initSession();
			    sess.prepare();
			},
			
			populateExpectedList: function(inviteObj){
				this.attendeeList.inviteList = inviteObj;
				for(var user in inviteObj){
					var a = this.attendeeList._createInactiveUser(user);	
					dojo.connect(a.domNode, 'ondblclick', this, function(e){
						if(dojo.attr(e.target, 'active') == false){
							var name = e.target.id.substring(0, e.target.id.length-3);
							this.attendeeList.onActivateUser(name);
						}
					});
				}
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
				var user = this.users[e];
				user['present'] = false;
				this.userCount--;
				
				//Adjust user clock
				var selected = this.attendeeList.selected;
				if(selected != null){
					this.userClock.seconds = this.getUserTimeRemaining(selected);
					if(e == selected){
						this.userClock.stop();
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
			
			_onUrlUp: function(){
				var url = dojo.attr('urlBar','value');
				dojo.attr('scrumFrame','src', url);
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
			}
		};
		
		dojo.ready(function() {
	        app.init();
	    });
	}
);