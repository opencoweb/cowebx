//
// Cooperative app 
//
// Copyright (c) The Dojo Foundation 2011. All Rights Reserved.
// Copyright (c) IBM Corporation 2008, 2011. All Rights Reserved.
//

define(
	//App-specific dependencies
	[
		'coweb/main',
		'dojox/mobile/parser',
		'Clock',
		'AttendeeList',
		'dojo/fx',
		'dojox/mobile',
		'dojox/mobile/FixedSplitter',
		'dojox/mobile/ScrollableView'
	],

	function(
		coweb,
		parser,
		Clock,
		AttendeeList) {
		
		var app = {
			init: function(){
				//Housekeeping
				this.timeAllotted = 0;
				this.users = {};
				this.status = 'stopped';
				
				// parse declarative widgets
			   	parser.parse(dojo.body());
				
				//Set up clocks (User, Total, and durationTimer)
				var length = 10;
				if(this.aquireUrlParams('length') != null)
					length = this.aquireUrlParams('length');
				this.totalClock = new Clock({id : 'totalClock', type : 'total', time: length });
				this.userClock = new Clock({id : 'userClock', type : 'user', time: 0 });
				this.t = new dojox.timing.Timer(1000);
				dojo.connect(this.t, 'onTick', this, '_onTick');
				
				//Set up attendeeList
				this.attendeeList = new AttendeeList({id : 'dailyscrum_list'});
				
				//Setup iFrame
				var url = '';
				if(this.aquireUrlParams('url') != null)
					url = 'http://'+this.aquireUrlParams('url');
				dojo.attr('scrumFrame','src', url);
				
				//Subscribe to collab events
				this.collab = coweb.initCollab({id : 'dailyscrum'}); 

				//Listen for local events
				dojo.connect(this.attendeeList, '_userClick', this, 'onUserClick');
				dojo.connect(this.attendeeList, '_userJoin', this, 'onUserJoin');
				dojo.connect(this.attendeeList, '_userLeave', this, 'onUserLeave');
				dojo.connect(dojo.byId('start'), 'onclick', this, 'onStartClick');
				dojo.connect(dojo.byId('plusOne'),'onclick',this,'onAddMinute');

				//Listen for remote events
				this.collab.subscribeSync('userClick', this, 'onRemoteUserClick');
				this.collab.subscribeSync('startClick', this, 'onRemoteStartClick');
				this.collab.subscribeSync('addMinute', this, 'onRemoteAddMinute');
				this.collab.subscribeStateRequest(this, 'onStateRequest');
	            this.collab.subscribeStateResponse(this, 'onStateResponse');

			   	// get a session instance
			    var sess = coweb.initSession();
			    // do the prep
			    sess.prepare();
			},
			
			onUserJoin: function(objArray){
				//Change the time allotted per user
				this.timeAllotted = Math.floor((this.totalClock.time*60) / this.attendeeList.count);
				
				//If the users are new, add them the the user object
				//and set their 'time spoken' to 0
				for(var i=0; i<objArray.length; i++){
					if(!(this.users[objArray[i]['site']]))
						this.users[objArray[i]['site']] = 0;
				}
				
				//Update the user clock with new calc'ed time
				this.userClock.seconds = this.timeAllotted-this.users[this.attendeeList.selectedId];
				if(this.userClock.seconds > this.totalClock.seconds)
					this.userClock.seconds = this.totalClock.seconds;
				if(this.users[this.attendeeList.selectedId] != undefined)
					this.userClock._renderTime();
				
				//Update time next to speakers
				for(var entry in this.users){
					if(dojo.byId(entry+"_count").innerHTML != this.users[entry]){
						dojo.byId(entry+"_count").innerHTML = this._formatTime(this.users[entry]);
					}
				}
			},
			
			onUserLeave: function(objArray){
				//Housekeeping
				var render = true;	
				
				//Change the time allotted per user
				this.timeAllotted = Math.floor((this.totalClock.time*60) / this.attendeeList.count);
				
				//Delete from users object. If the users are currently
				//speaking, stop user clock and 'duration' timer
				for(var i=0; i<objArray.length; i++){
					if(objArray[i]['site'] == this.attendeeList.selectedId){
						this.userClock.stop();
						this.t.stop();
						this.status = 'stopped';
						render = false;
					}
					delete this.users[objArray[i]['site']];
				}
				
				//Update user clock depending on whether user who
				//left was speaking or not and render
				if(render == true && (this.users[this.attendeeList.selectedId] != undefined)){
					this.userClock.seconds = this.timeAllotted-this.users[this.attendeeList.selectedId];
				}else{
					this.userClock.seconds = 0;
				}
				this.userClock._renderTime();
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
			
			onStateRequest: function(token){
				var state = {
					//User/spokenTime object
					thisUsers : this.users,
					
					//AttendeeList status vars
	                attendeeClicked : this.attendeeList.clicked,
	                attendeeSelected : this.attendeeList.selected,
					attendeeSelectedId : this.attendeeList.selectedId,
					attendeePrevSelectedId : this.attendeeList.prevSelectedId,
					
					//totalClock status vars
					totalTest : this.totalClock.test,
					totalSeconds : this.totalClock.seconds,
					totalStatus : this.totalClock.status,
					
					//userClock status vars
					userTest : this.userClock.test,
					userSeconds : this.userClock.seconds,
					userStatus : this.userClock.status,
					
					//durationTimer status vars
					status : this.status
	            };
	            this.collab.sendStateResponse(state,token);
			},
			
			onStateResponse: function(state){
				//User/spokenTime object
				this.users = state.thisUsers;
				
				//AttendeeList status vars
				this.attendeeList.clicked = state.attendeeClicked;
				this.attendeeList.selected = state.attendeeSelected;
				this.attendeeList.selectedId = state.attendeeSelectedId;
				this.attendeeList.prevSelectedId = state.attendeePrevSelectedId;
				
				//totalClock status vars
				this.totalClock.test = state.totalTest;
				this.totalClock.seconds = state.totalSeconds;
				this.totalClock.status = state.totalStatus;
				
				//userClock status vars
				this.userClock.test = state.userTest;
				this.userClock.seconds = state.userSeconds;
				this.userClock.status = state.userStatus;
				
				//durationTimer status vars
				this.status = state.status;
				
				
				//Once we have our state, update the clocks
				this.totalClock._renderTime();
				this.userClock._renderTime();
				
				//Start them if necessary
				if(this.totalClock.status == 'started')
					this.totalClock.start();			
				if(this.userClock.status == 'started')
					this.userClock.start();
				if(this.status == 'started')
					this.t.start();
					
				//Update the title bar
				dojo.attr('speaker','innerHTML',"Current Speaker: "+this.attendeeList.selected);
			},
			
			onUserClick: function(){
				//Restart the durationTimer timing the current speaker
				this.t.stop();
				this.t.start();
				this.status = 'started';
				
				//Recalculate userClock seconds and restart
				this.userClock.stop();
				this.userClock.seconds = this.timeAllotted-this.users[this.attendeeList.selectedId];
				if(this.userClock.seconds > this.totalClock.seconds)
					this.userClock.seconds = this.totalClock.seconds;
				this.userClock.start(); 
				
				//Change the title bar
				dojo.attr('speaker','innerHTML',"Current Speaker: "+this.attendeeList.selected);
				
				//Reset the extraMins since we're on a new user
				this.userClock.extraMins = 0;
				
				//Start the total clock if it's stopped, and sync
				if(this.totalClock.status == 'stopped')
					this.totalClock.start();
				this.collab.sendSync('userClick', { 
					selected: this.attendeeList.selected,
					selectedId: this.attendeeList.selectedId,
					prevSelectedId: this.attendeeList.prevSelectedId
				}, null);
				
				//Housekeeping
				this.attendeeList.prevSelectedId = this.attendeeList.selectedId;
			},
			
			onRemoteUserClick: function(obj){
				//Populate vars based on sync obj
				this.attendeeList.selected = obj.value.selected;
				this.attendeeList.selectedId = obj.value.selectedId;
				this.attendeeList.prevSelectedid = obj.value.prevSelectedId;
				
				//Restart the durationTimer timing the current speaker
				this.t.stop();			
				this.t.start();
				this.status = 'started';
				
				//Recalculate userClock seconds and restart
				this.userClock.stop();				
				this.userClock.seconds = this.timeAllotted-this.users[this.attendeeList.selectedId];
				if(this.userClock.seconds > this.totalClock.seconds)
					this.userClock.seconds = this.totalClock.seconds;
				this.userClock.start();
				
				//Change the title bar
				dojo.attr('speaker','innerHTML',"Current Speaker: "+this.attendeeList.selected);
				
				//Reset the extraMins since we're on a new user
				this.userClock.extraMins = 0;
				
				//Start the total clock if it's stopped
				if(this.totalClock.status == 'stopped')
					this.totalClock.start();
					
				//Housekeeping
				this.attendeeList.prevSelectedId = this.attendeeList.selectedId;
			},
			
			onStartClick: function(){
				//Start (or stop) totalClock, userClock, 
				//and durationTimer
				if(this.totalClock.status == 'stopped'){
					this.totalClock.start();
					if(this.attendeeList.clicked == true){
						this.userClock.start();
						this.t.start();
						this.status = 'started';
					}
				}else if(this.totalClock.status == 'started'){
					this.userClock.stop();
					this.totalClock.stop();
					this.t.stop();
					this.status = 'stopped';
				}
				
				//Sync
				this.collab.sendSync('startClick', { }, null);
			},
			
			onRemoteStartClick: function(){
							//Start (or stop) totalClock, userClock, 
							//and durationTimer
				if(this.totalClock.status == 'stopped'){
					this.totalClock.start();
					if(this.attendeeList.clicked == true){
						this.userClock.start();
						this.t.start();
						this.status = 'started';
					}
				}else if(this.totalClock.status == 'started'){
					this.userClock.stop();
					this.totalClock.stop();
					this.t.stop();
					this.status = 'stopped';
				}
			},
			
			onAddMinute: function(){
				this.userClock.addMinute();
				if(this.userClock.seconds > this.totalClock.seconds)
					this.userClock.seconds = this.totalClock.seconds;
				this.collab.sendSync('addMinute', { }, null);
				this.userClock._renderTime();
			},
			
			onRemoteAddMinute: function(){
				this.userClock.addMinute();
				if(this.userClock.seconds > this.totalClock.seconds)
					this.userClock.seconds = this.totalClock.seconds;
				this.userClock._renderTime();
			},
			
			_onTick: function(){
				this.users[this.attendeeList.selectedId] = this.users[this.attendeeList.selectedId]+1;
				dojo.byId(this.attendeeList.selectedId+"_count").innerHTML = this._formatTime(this.users[this.attendeeList.selectedId]);
				
			},
			
			_formatTime: function(time){
				var min = Math.floor(time/60);
				if(min < 10)
					min = "0"+min;
				var secs = time%60;
				if(secs<10)
					secs = "0"+secs;
				return min + ":" + secs;
			}
		};
		
		dojo.ready(function() {
	        app.init();
	    });
	}
);