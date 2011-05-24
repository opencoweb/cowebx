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
		'dojox/mobile',
		'dojox/mobile/FixedSplitter',
		'dojox/mobile/ScrollableView',
		'AttendeeList',
		'Clock',
		'dojo/fx'
	],

	function(
		coweb,
		parser,
		mobile,
		FixedSplitter,
		ScrollableView,
		AttendeeList,
		Clock,
		fx,
		compat) {
		
		var app = {
			init: function(){
				//Housekeeping
				
				//Subscribe to collab events
				this.collab = coweb.initCollab({id : 'dailyscrum'}); 

				// parse declarative widgets
			   	parser.parse(dojo.body());

				// set up AttendanceList and Clocks
				var length = 10;
				if(this.aquireUrlParams('length') != null)
					length = this.aquireUrlParams('length');
				this.totalClock = new Clock({id : 'totalClock', type : 'total', time: length });
				this.attendeeList = new AttendeeList({id : 'dailyscrum_list'});
				this.userClock = new Clock({id : 'userClock', type : 'user', time: 0 });
				
				//Setup iFrame
				var url = '';
				if(this.aquireUrlParams('url') != null)
					url = 'http://'+this.aquireUrlParams('url');
				dojo.attr('scrumFrame','src', url);

				//Listen for local events
				dojo.connect(this.attendeeList, '_userClick', this, 'onUserClick');
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
	                attendeeClicked : this.attendeeList.clicked,
	                attendeeSelected : this.attendeeList.selected,
					totalTest : this.totalClock.test,
					totalSeconds : this.totalClock.seconds,
					totalStatus : this.totalClock.status,
					totalInitial : this.totalClock.initial,
					userTest : this.userClock.test,
					userSeconds : this.userClock.seconds,
					userStatus : this.userClock.status,
					userExtraMins: this.userClock.extraMins
	            };
	            this.collab.sendStateResponse(state,token);
			},
			
			onStateResponse: function(state){
				console.log('response');
				this.attendeeList.clicked = state.attendeeClicked;
				this.attendeeList.selected = state.attendeeSelected;
				this.totalClock.test = state.totalTest;
				this.totalClock.seconds = state.totalSeconds;
				this.totalClock.status = state.totalStatus;
				this.totalClock.initial = state.totalInitial;
				this.userClock.test = state.userTest;
				this.userClock.seconds = state.userSeconds;
				this.userClock.status = state.userStatus;
				this.userClock.extraMins = state.userExtraMins;
				
				this.totalClock._renderTime();
				this.userClock._renderTime();
				
				if(this.totalClock.status == 'started')
					this.totalClock.start();			
				if(this.userClock.status == 'started')
					this.userClock.start();
				dojo.attr('speaker','innerHTML',"Current Speaker: "+this.attendeeList.selected);
				//dojo.attr('minutesAdded','innerHTML',this.userClock.extraMins);
			},
			
			onUserClick: function(){
				this.userClock.stop();
				this.userClock.seconds = Math.floor(this.totalClock.seconds / this.attendeeList.count);
				this.userClock.start(); 
				dojo.attr('speaker','innerHTML',"Current Speaker: "+this.attendeeList.selected);
				//dojo.attr('minutesAdded','innerHTML','   ');
				this.userClock.extraMins = 0;
				if(this.totalClock.status == 'stopped')
					this.totalClock.start();
				this.collab.sendSync('userClick', { }, null);
			},
			
			onRemoteUserClick: function(){
				this.userClock.stop();
				this.userClock.seconds = Math.floor(this.totalClock.seconds / this.attendeeList.count);
				this.userClock.start();
				dojo.attr('speaker','innerHTML',"Current Speaker: "+this.attendeeList.selected);
				//dojo.attr('minutesAdded','innerHTML','   ');
				this.userClock.extraMins = 0;
				if(this.totalClock.status == 'stopped')
					this.totalClock.start();
			},
			
			onStartClick: function(){
				if(this.totalClock.status == 'stopped'){
					this.totalClock.start();
					if(this.attendeeList.clicked == true)
						this.userClock.start();
				}else if(this.totalClock.status == 'started'){
					this.userClock.stop();
					this.totalClock.stop();
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
				}
			},
			
			onAddMinute: function(){
				this.userClock.addMinute();
				//dojo.attr('minutesAdded','innerHTML',this.userClock.extraMins);
				this.collab.sendSync('addMinute', { }, null);
			},
			
			onRemoteAddMinute: function(){
				//dojo.attr('minutesAdded','innerHTML',this.userClock.extraMins);
				this.userClock.addMinute();
			}
		};
		
		dojo.ready(function() {
	        app.init();
	    });
	}
);