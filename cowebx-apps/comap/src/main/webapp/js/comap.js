//
// Cooperative map application.
//
// Copyright (c) The Dojo Foundation 2011. All Rights Reserved.
// Copyright (c) IBM Corporation 2008, 2011. All Rights Reserved.
//
/*global define dojo dijit cowebx*/
define([
    'dojo',
    'dijit/registry',
    'coweb/main',
    'coweb/ext/attendance',
    'cowebx/dojo/GMap/GMap',
    'cowebx/dojo/ChatBox/ChatBox',
	'dojo/parser',
	'cowebx/dojo/BusyDialog/BusyDialog',
    'dijit/layout/BorderContainer',
    'dijit/layout/AccordionContainer',
    'dijit/layout/AccordionPane',
    'dijit/Toolbar',
    'dijit/form/Button',
    'dijit/form/CheckBox',
    'dojo/hash',
    'dojo/domReady!'
], function(dojo, dijit, coweb, attendance, GMap, ChatBox, parser, BusyDialog) {
    // define controller singleton for the app
    var app = {
        init: function() {
            // quick and dirty i18n
            var body = dojo.body();
            this.labels = {
                map_source : 'Map',
                add_notice : 'Added a marker at <a href="#{0}">{0}</a>',
                move_notice : 'Moved a marker to <a href="#{0}">{0}</a>',
                anim_notice : 'Bounced a marker at <a href="#{0}">{0}</a>',
                sync_button_label : 'Sync map',
                chat_pane_title : 'Chat',
                log_pane_title : 'Map Log',
                help_pane_title : 'Help',
                continuous_sync_button_label : 'Sync always'
            };
            var html = dojo.replace(body.innerHTML, this.labels);
            body.innerHTML = html;

            // make visible and parse for widgets now
            dojo.style(body, 'display', '');
			parser.parse();
    
            // grab widgets
            this.map = dijit.byId('map');
            this.chat = dijit.byId('chat');
            this.log = dijit.byId('log');
            
            this.map.markerTemplate = '<p>{_formattedAddress}</p><p>Visits today: {_visitCount}</p>';

            // hand widgets refs to this controller
            this.map.attr('app', this);
            this.chat.attr('app', this);
    
            // listen for local events
			dojo.connect(this.map, 'onMapMarkerMoved', this, 'onMapMarkerMoved');
			dojo.connect(this.map, 'onMapMarkerAdded', this, 'onMapMarkerAdded');
			dojo.connect(this.map, 'onMapMarkerAnimated', this, 'onMapMarkerAnimated');
			dojo.connect(dijit.byId('layout'), 'resize', this.map, 'resize');

            // listen to remote events
            this.collab = coweb.initCollab({id : 'comap'});
            this.collab.subscribeReady(this, 'onCollabReady');
            this.collab.subscribeSync('log.message', this, 'onRemoteLogMsg');
            this.collab.subscribeSync('mod.zipvisits', this, "onZipVisits");
    
            // avoid a splitter layout bug by forcing a resize after load
            dijit.byId('layout').resize();

            // get a session instance
            this.session = coweb.initSession();
			BusyDialog.createBusy(this.session);
			
            // do the prep using defaults
            this.session.prepare();
        },

		onMapMarkerAdded: function(marker) {
            // include in local log
            var args = {
                template : 'add_notice',
                username : this.username,
                latLng : marker.getPosition().toUrlValue()
            };
            var position = this.log._insertLogMessage(args);
            // send to remote logs
            this.collab.sendSync('log.message', args, 'insert', position);
        },

		onMapMarkerMoved: function(marker) {
            // include in local log
            var args = {
                template: 'move_notice',
                username : this.username,
                latLng : marker.getPosition().toUrlValue()
            };
            var position = this.log._insertLogMessage(args);
            // send to remote logs
            this.collab.sendSync('log.message', args, 'insert', position);
        },
		
		onMapMarkerAnimated: function(marker) {
            // include in local log
            var args = {
                template : 'anim_notice',
                username : this.username,
                latLng : marker.getPosition().toUrlValue()
            };
            var position = this.log._insertLogMessage(args);
            // send to remote logs
            this.collab.sendSync('log.message', args, 'insert', position);
        },
        
        onRemoteLogMsg: function(obj) {
            this.log.onRemoteLogMessage(obj);
        },
    
        onCollabReady: function(info) {
            // store username for use by widgets
            this.username = info.username;
            /* Must wait until the collab object is ready to subscribe
             * to bots. */
            this.collab.subscribeService("datebot", function(data) {
                if (data.error) {
                    /* Could not subscribe - moderator didn't allow it. */
                } else {
                    console.log("datebot published: " + data.value.date);
                }
            });
        },
    
        onZipVisits: function(args) {
            if (0) {
            this.collab.postService("datebot", {"dummy" : 0}, function(data) {
                if (data.error) {
                    /* Moderator doesn't alow us to post messages. */
                } else {
                    console.log("datebot responded to private message, count=" +
                        data.value.total);
                }
            });
            }
            var counts = args.value;
            for(var uuid in counts) {
                if(counts.hasOwnProperty(uuid)) {
                    var marker = this.map.getMarkerById(uuid);
                    marker._visitCount = args.value[uuid];
                }
            }
            // refresh the current info popup
            this.map.refreshInfoPop();
        }
    };

    // initialize the app when all modules load and page is ready
    app.init();
});
