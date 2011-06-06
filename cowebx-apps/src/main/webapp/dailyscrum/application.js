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
				//Parse the invite list
				this.invites = dojo.xhrGet({
					url: 'invites.json',
					handleAs: 'json',
					load: dojo.hitch(this, function(data){ 
						this.populateExpectedList(data);  
						this.mode = 'json'
					}),
					error: function(error) { console.log(error); }
				});
				
				//Parse declarative widgets
			   	parser.parse(dojo.body());
				
				//Set up clocks (User, Total, and durationTimer)
				var length = (this.aquireUrlParams('length') != null) ? this.aquireUrlParams('length') : 10;
				this.totalClock = new Clock({id : 'totalClock', type : 'total', time: length });
				this.userClock = new Clock({id : 'userClock', type : 'user', time: 0 });
				
				//Set up attendeeList & connect list activation to local func
				this.attendeeList = new AttendeeList({id : 'dailyscrum_list'});
				
				//Setup iFrame URL
				var url = (this.aquireUrlParams('url') != null) ? this.aquireUrlParams('url') : '';
				dojo.attr('scrumFrame','src', url);
				
				//Connect to events
				dojo.connect(this.attendeeList, 'onUserClick', this, 'onUserClick');
				dojo.connect(this.attendeeList, 'onRemoteUserClick', this, 'onUserClick');
				dojo.connect(this.attendeeList, '_activateUser', this, 'onActivateUser');
				dojo.connect(this.attendeeList, '_deactivateUser', this, 'onDectivateUser');
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
							this.attendeeList._activateUser(name);
						}
					});
				}
			},
			
			onActivateUser: function(e){
				console.log("activate ",e);
				
			},
			
			onDectivateUser: function(e){
				console.log("deactivate ",e);
				
			},
			
			onUserClick: function(){
				var selected = this.attendeeList.selected;
				console.log("selected ",selected);
				
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