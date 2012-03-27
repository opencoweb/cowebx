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
    'ChatBox',
	'dojo/parser',
    'dijit/layout/BorderContainer',
    'dijit/layout/AccordionContainer',
    'dijit/layout/AccordionPane',
    'dijit/Toolbar',
    'dijit/form/Button',
    'dijit/form/CheckBox',
    'dojo/hash',
    'dojo/domReady!'
], function(dojo, dijit, coweb, attendance, GMap, ChatBox, parser) {
    // dojo.require('comap.GMap');
    // dojo.require('comap.ChatBox');

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
            dojo.connect(this.chat, 'onMessage', this, 'onChatMessage');
			dojo.connect(this.map, 'onMapMarkerMoved', this, 'onMapMarkerMoved');
			dojo.connect(this.map, 'onMapMarkerAdded', this, 'onMapMarkerAdded');
			dojo.connect(this.map, 'onMapMarkerAnimated', this, 'onMapMarkerAnimated');
			dojo.connect(dijit.byId('layout'), 'resize', this.map, 'resize');

            // listen to remote events
            this.collab = coweb.initCollab({id : 'comap'});
            this.collab.subscribeReady(this, 'onCollabReady');
            this.collab.subscribeStateRequest(this, 'onStateRequest');
            this.collab.subscribeStateResponse(this, 'onStateResponse');
            this.collab.subscribeSync('chat.message', this, 'onRemoteChatMessage');
            this.collab.subscribeSync('log.message', this, 'onRemoteLogMessage');
    
            // avoid a splitter layout bug by forcing a resize after load
            dijit.byId('layout').resize();

            // get a session instance
            this.session = coweb.initSession();

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
            var position = this._insertLogMessage(args);
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
            var position = this._insertLogMessage(args);
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
            var position = this._insertLogMessage(args);
            // send to remote logs
            this.collab.sendSync('log.message', args, 'insert', position);
        },
    
        onStateRequest: function(token) {
            var state = {
                logHtml : this.log.getHtml(),
                chatHtml : this.chat.getHtml(),
            };
            this.collab.sendStateResponse(state, token);
        },
    
        onStateResponse: function(state) {
            this.chat.setHtml(state.chatHtml);
            this.log.setHtml(state.logHtml);
        },
    
        onCollabReady: function(info) {
            // store username for use by widgets
            this.username = info.username;
            // subscribe to zip data from bots
            this.collab.subscribeService('zipvisits', this, 'onZipVisits');
        },
    
        onZipVisits: function(args) {
            if(args.error) {
                console.error('could not subscribe to zipvisits service');
                return;
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
        },
        
        onChatMessage: function(text, position, isoDT) {
            var value = {text : text, isoDT : isoDT};
            // send raw value, will be parsed / sanitized on the other side
            this.collab.sendSync('chat.message', value, 'insert', position);
        },

        onRemoteChatMessage : function(args) {
            var username = attendance.users[args.site].username;
            // sanitize received text
            args.value.text = this.chat.sanitizeText(args.value.text);
            // parse for http links
            args.value.text = this.chat.parseLinks(args.value.text);
            this.chat.insertMessage(username, args.value.text, 
                args.value.isoDT, args.position);
        },
    
        _insertLogMessage: function(args) {
            // make sure latlng isn't bogus
            var latLng = this.log.sanitizeText(args.latLng);
            var text = dojo.replace(this.labels[args.template], [latLng]);
            var rv = this.log.insertMessage(args.username, text, args.isoDT, 
                args.position);
            args.isoDT = rv.isoDT;
            delete args.username;
            return rv.position;
        },

        onRemoteLogMessage : function(args) {
            args = dojo.mixin({
                username : attendance.users[args.site].username,
                position : args.position
            }, args.value);
            this._insertLogMessage(args);
        }
    };

    // initialize the app when all modules load and page is ready
    app.init();
});