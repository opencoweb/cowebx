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
				this.timeAllotted = 0;			//Speaking time for each user
				this.users = {};				//User <-> spoken time map
				this.status = 'stopped';		//Status of speaking duration timer
				this.localId = null;
				this.modName = (this.aquireUrlParams('mod') != null) ? this.aquireUrlParams('mod') : null;
				this.modId = null;
				
			   	parser.parse(dojo.body());
				
				//Set up clocks (User, Total, and durationTimer)
				var length = (this.aquireUrlParams('length') != null) ? this.aquireUrlParams('length') : 10;
				this.totalClock = new Clock({id : 'totalClock', type : 'total', time: length });
				this.userClock = new Clock({id : 'userClock', type : 'user', time: 0 });
				this.t = new dojox.timing.Timer(1000);
				
				//Set up attendeeList
				this.attendeeList = new AttendeeList({id : 'dailyscrum_list'});
				
				//Setup iFrame URL
				var url = (this.aquireUrlParams('url') != null) ? this.aquireUrlParams('url') : '';
				dojo.attr('scrumFrame','src', url);
				
				//Listen for local & remote events
				this._listenLocally();
				this._listenRemotely();
				
			   	// get a session instance & prep
			    var sess = coweb.initSession();
			    sess.prepare();
			},
			
			onUserJoin: function(objArray){
				//Change the time allotted per user
				this.timeAllotted = Math.floor((this.totalClock.seconds) / this.attendeeList.count);
				
				//If the users are new, add them the the user object
				//and set their 'time spoken' to 0
				for(var i=0; i<objArray.length; i++){
					if(!(this.users[objArray[i]['site']]))
						this.users[objArray[i]['site']] = 0;
					if(objArray[i]['username'] == this.modName)
						this.modId = objArray[i]['site'];
					if(objArray[i].local == true)
						this.localId = (this.modName == null) ? null : objArray[i]['site'];
				}

				//Update the user clock with new calc'ed time
				this.userClock.seconds = Math.abs(this.timeAllotted-this.users[this.attendeeList.selectedId]);

				if(this.users[this.attendeeList.selectedId] != undefined)
					this.userClock._renderTime();
				
				//Update time next to speakers
				for(var entry in this.users){
					if(dojo.byId(entry+"_count").innerHTML != this.users[entry]){
						dojo.byId(entry+"_count").innerHTML = this._formatTime(this.users[entry]);
					}
				}
				
				//Update this.attendeeList selection (not in state response because
				// <li>s havent been added to the list until userjoins AFTER response)
				if(dijit.byId(this.attendeeList.selectedId) != undefined)
					dijit.byId(this.attendeeList.selectedId).select();
				
				//Render elements based on MOD or notMOD
				if((this.localId == this.modId) && (!this.attendeeList.clicked)){
					dojo.style('selectTip','display','block');
					dojo.style('plusOne','display','inline');
				}
			},
			
			onUserLeave: function(objArray){
				//Housekeeping
				var render = true;	
				
				//Change the time allotted per user
				this.timeAllotted = Math.floor((this.totalClock.seconds) / this.attendeeList.count);
				console.log("New time allotted = "+this.timeAllotted);
				
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
					this.userClock.seconds = Math.abs(this.timeAllotted-this.users[this.attendeeList.selectedId]);
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
				if(this.totalClock.status == 'started'){
					this.totalClock.start();
					dojo.style('start','display','inline');
					dojo.style('selectTip','display','none');
				}			
				if(this.userClock.status == 'started')
					this.userClock.start();
				if(this.status == 'started')
					this.t.start();
					
				//Update the title bar
				dojo.attr('speaker','innerHTML',"Current Speaker: "+this.attendeeList.selected);
			},
			
			onUserClick: function(){
				if(this.localId == this.modId){
					//Restart the durationTimer timing the current speaker
					this.t.stop();
					this.t.start();
					this.status = 'started';
				
					//Recalculate userClock seconds and restart
					this.userClock.stop();
					if(this.attendeeList.selectedId != this.attendeeList.prevSelectedId){
						this.userClock.extraMins = 0;
						this.userClock.seconds = this.timeAllotted-this.users[this.attendeeList.selectedId];
						if(this.userClock.seconds < 0){
							this.userClock.seconds = Math.abs(this.userClock.seconds);
							this.userClock.test = 'neg';
							dojo.style('userClock','color','red');
						}else{
							this.userClock.test = 'pos';
							dojo.style('userClock','color','grey');
						}
					}else{
						this.userClock.seconds = Math.abs(this.timeAllotted-this.users[this.attendeeList.selectedId]+(this.userClock.extraMins*60));
					}
					
					this.userClock.start(); 
				
					//Change the title bar
					dojo.attr('speaker','innerHTML',"Current Speaker: "+this.attendeeList.selected);
				
					//Start the total clock if it's stopped, and sync
					if(this.totalClock.status == 'stopped')
						this.totalClock.start();
					dojo.style('start','display','inline');
					dojo.style('selectTip','display','none');
				
					this.collab.sendSync('userClick', { 
						selected: this.attendeeList.selected,
						selectedId: this.attendeeList.selectedId,
						prevSelectedId: this.attendeeList.prevSelectedId
					}, null);
				
					//Housekeeping
					this.attendeeList.prevSelectedId = this.attendeeList.selectedId;
				}
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
				if(this.attendeeList.selectedId != this.attendeeList.prevSelectedId){
					this.userClock.extraMins = 0;
					this.userClock.seconds = this.timeAllotted-this.users[this.attendeeList.selectedId];
					if(this.userClock.seconds < 0){
						this.userClock.seconds = Math.abs(this.userClock.seconds);
						dojo.style('userClock','color','red');
						this.userClock.test = 'neg';
					}else{
						this.userClock.test = 'pos';
						dojo.style('userClock','color','grey');
					}
				}else{
					this.userClock.seconds = Math.abs(this.timeAllotted-this.users[this.attendeeList.selectedId]+(this.userClock.extraMins*60));
				}
						
				this.userClock.start();
			
				//Change the title bar and attendeeList selection
				dojo.attr('speaker','innerHTML',"Current Speaker: "+this.attendeeList.selected);
				dijit.byId(this.attendeeList.selectedId).select();
			
				//Start the total clock if it's stopped
				if(this.totalClock.status == 'stopped')
					this.totalClock.start();
			
				//Housekeeping
				this.attendeeList.prevSelectedId = this.attendeeList.selectedId;
			},
			
			onRemoteStartClick: function(obj){
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
				if(this.attendeeList.clicked == true){
					this.userClock.addMinute();
					this.collab.sendSync('addMinute', { }, null);
					this.userClock._renderTime();
				}
			},
			
			onRemoteAddMinute: function(){
				this.userClock.addMinute();
				this.userClock._renderTime();
			},
			
			_listenLocally: function(){
				dojo.connect(this.attendeeList, '_userClick', this, 'onUserClick');
				dojo.connect(this.attendeeList, '_userJoin', this, 'onUserJoin');
				dojo.connect(this.attendeeList, '_userLeave', this, 'onUserLeave');
				dojo.connect(dojo.byId('plusOne'),'onclick',this,'onAddMinute');
				dojo.connect(dojo.byId('start'),'onmousedown',this,'_onStartDown');
				dojo.connect(dojo.byId('start'),'onmouseup',this,'_onStartUp');
				dojo.connect(dijit.byId('scrumFrameView'),'resize',this,'_ffResize');
				dojo.connect(this.t, 'onTick', this, '_onTick');
				dojo.connect(dojo.byId('urlSubmit'),'onmouseup',this,'_onUrlUp');
				dojo.connect(dojo.byId('urlBar'),'onkeydown',this,function(e){ if(e.keyCode == 13){ this._onUrlUp(); }});
			},
			
			_listenRemotely: function(){
				this.collab = coweb.initCollab({id : 'dailyscrum'}); 
				this.collab.subscribeSync('userClick', this, 'onRemoteUserClick');
				this.collab.subscribeSync('startClick', this, 'onRemoteStartClick');
				this.collab.subscribeSync('addMinute', this, 'onRemoteAddMinute');
				this.collab.subscribeStateRequest(this, 'onStateRequest');
	            this.collab.subscribeStateResponse(this, 'onStateResponse');
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
			},
			
			_onStartUp: function(){
				if(this.localId == this.modId){
					dojo.attr('start', 'src', 'images/stop.png')
				
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
				}
			},
			
			_onStartDown: function(){
				dojo.attr('start', 'src', 'images/stop_down.png')
			},
			
			_onUrlUp: function(){
				var url = dojo.attr('urlBar','value');
				console.log('url = '+url);
				dojo.attr('scrumFrame','src', url);
			},
			
			_ffResize: function(e){
				var height = dijit.byId('container').domNode.clientHeight-150;
				dojo.style(dijit.byId('scrumFrameView').domNode,'height',height+"px");
			}
		};
		
		dojo.ready(function() {
	        app.init();
	    });
	}
);