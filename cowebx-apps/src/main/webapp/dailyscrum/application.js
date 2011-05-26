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
				dojo.connect(this.t, 'onTick', this, '_onTick');

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
				this.timeAllotted = Math.floor((this.totalClock.time*60) / this.attendeeList.count);
				for(var i=0; i<objArray.length; i++){
					if(!(this.users[objArray[i]['site']]))
						this.users[objArray[i]['site']] = 0;
				}
				this.userClock.seconds = this.timeAllotted-this.users[this.attendeeList.selectedId];
				if(this.users[this.attendeeList.selectedId] != undefined){
					this.userClock._renderTime();
				}
				//Time next to speakers
				for(var entry in this.users){
					if(dojo.byId(entry+"_count").innerHTML != this.users[entry]){
						dojo.byId(entry+"_count").innerHTML = this.users[entry];
					}
					 
				}
			},
			
			onUserLeave: function(objArray){
				var render = true;
				this.timeAllotted = Math.floor((this.totalClock.time*60) / this.attendeeList.count);
				for(var i=0; i<objArray.length; i++){
					if(objArray[i]['site'] == this.attendeeList.selectedId){
						this.userClock.stop();
						this.t.stop();
						this.status = 'stopped';
						render = false;
					}
					delete this.users[objArray[i]['site']];
				}
				if(render == true && (this.users[this.attendeeList.selectedId] != undefined)){
					this.userClock.seconds = this.timeAllotted-this.users[this.attendeeList.selectedId];
					console.log(this.userClock.seconds);
				}else{
					this.userClock.seconds = 0;
				}
				this.userClock._renderTime();
			},
			
			aquireUrlParams: function(param){
				param = param.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
				var regexS = "[\\?&]"+param+"=([^&#]*)";
				var regex = new RegExp( regexS );
				var results = regex.exec( window.location.href );
				if( results == null )
					return null;
				else
					return results[1];
			},
			
			onStateRequest: function(token){
				console.log('request');
				var state = {
					thisUsers : this.users,
	                attendeeClicked : this.attendeeList.clicked,
	                attendeeSelected : this.attendeeList.selected,
					attendeeSelectedId : this.attendeeList.selectedId,
					attendeePrevSelectedId : this.attendeeList.prevSelectedId,
					totalTest : this.totalClock.test,
					totalSeconds : this.totalClock.seconds,
					totalStatus : this.totalClock.status,
					totalInitial : this.totalClock.initial,
					userTest : this.userClock.test,
					userSeconds : this.userClock.seconds,
					userStatus : this.userClock.status,
					status : this.status
	            };
	            this.collab.sendStateResponse(state,token);
			},
			
			onStateResponse: function(state){
				this.users = state.thisUsers;
				this.attendeeList.clicked = state.attendeeClicked;
				this.attendeeList.selected = state.attendeeSelected;
				this.attendeeList.selectedId = state.attendeeSelectedId;
				this.attendeeList.prevSelectedId = state.attendeePrevSelectedId;
				this.totalClock.test = state.totalTest;
				this.totalClock.seconds = state.totalSeconds;
				this.totalClock.status = state.totalStatus;
				this.totalClock.initial = state.totalInitial;
				this.userClock.test = state.userTest;
				this.userClock.seconds = state.userSeconds;
				this.userClock.status = state.userStatus;
				this.status = state.status;
				
				this.totalClock._renderTime();
				this.userClock._renderTime();
				
				if(this.totalClock.status == 'started')
					this.totalClock.start();			
				if(this.userClock.status == 'started')
					this.userClock.start();
				if(this.status == 'started')
					this.t.start();
				dojo.attr('speaker','innerHTML',"Current Speaker: "+this.attendeeList.selected);
			},
			
			onUserClick: function(){
				this.t.stop();
				this.t.start();
				this.status = 'started';
				this.userClock.stop();
				this.userClock.seconds = this.timeAllotted-this.users[this.attendeeList.selectedId];
				if(this.userClock.seconds > this.totalClock.seconds)
					this.userClock.seconds = this.totalClock.seconds;
				this.userClock.start(); 
				dojo.attr('speaker','innerHTML',"Current Speaker: "+this.attendeeList.selected);
				this.userClock.extraMins = 0;
				if(this.totalClock.status == 'stopped')
					this.totalClock.start();
				this.prevSelected = this.attendeeList.selected;
				this.collab.sendSync('userClick', { 
					selected: this.attendeeList.selected,
					selectedId: this.attendeeList.selectedId,
					prevSelectedId: this.attendeeList.prevSelectedId
				}, null);
				this.attendeeList.prevSelectedId = this.attendeeList.selectedId;
			},
			
			onRemoteUserClick: function(obj){
				this.attendeeList.selected = obj.value.selected;
				this.attendeeList.selectedId = obj.value.selectedId;
				this.attendeeList.prevSelectedid = obj.value.prevSelectedId;
				
				this.t.stop();				
				this.t.start();
				this.status = 'started';
				this.userClock.stop();				
				this.userClock.seconds = this.timeAllotted-this.users[this.attendeeList.selectedId];
				if(this.userClock.seconds > this.totalClock.seconds)
					this.userClock.seconds = this.totalClock.seconds;
				this.userClock.start();
				dojo.attr('speaker','innerHTML',"Current Speaker: "+this.attendeeList.selected);
				this.userClock.extraMins = 0;
				if(this.totalClock.status == 'stopped')
					this.totalClock.start();
				this.attendeeList.prevSelectedId = this.attendeeList.selectedId;
			},
			
			onStartClick: function(){
				if(this.totalClock.status == 'stopped'){
					this.totalClock.start();
					if(this.attendeeList.clicked == true)
						this.userClock.start();
				}else if(this.totalClock.status == 'started'){
					this.userClock.stop();
					this.totalClock.stop();
					this.t.stop();
					this.status = 'stopped';
				}
				this.collab.sendSync('startClick', { }, null);
			},
			
			onRemoteStartClick: function(){
				if(this.totalClock.status == 'stopped'){
					this.totalClock.start();
					if(this.attendeeList.clicked == true)
						this.userClock.start();
				}else if(this.totalClock.status == 'started'){
					this.userClock.stop();
					this.totalClock.stop();
					this.t.stop();
					this.status = 'stopped';
				}
			},
			
			onAddMinute: function(){
				this.userClock.addMinute();
				this.collab.sendSync('addMinute', { }, null);
			},
			
			onRemoteAddMinute: function(){
				this.userClock.addMinute();
			},
			
			_onTick: function(){
				this.users[this.attendeeList.selectedId] = this.users[this.attendeeList.selectedId]+1;
				dojo.byId(this.attendeeList.selectedId+"_count").innerHTML = this.users[this.attendeeList.selectedId];
			}
		};
		
		dojo.ready(function() {
	        app.init();
	    });
	}
);