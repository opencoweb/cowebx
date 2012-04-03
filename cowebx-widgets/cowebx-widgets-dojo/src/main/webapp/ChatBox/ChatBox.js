//
// ChatBox logic and construction
//
// Copyright (c) The Dojo Foundation 2011. All Rights Reserved.
//

define([
    'dojo',
    'coweb/main',
	"dojo/_base/declare", // declare
	"dijit/_Widget",
	"dijit/_TemplatedMixin",
	"dijit/_Contained",
	"dojo/text!./ChatBox.html",
	'coweb/ext/attendance',
	'dojo/date/locale',
	'dojo/date/stamp'
], function(dojo, coweb, declare, _Widget, _TemplatedMixin, _Contained, template, attendance){

	return declare("ChatBox", [_Widget, _TemplatedMixin, _Contained], {
	    // widget template
		templateString: template,
		// application controller
        app: null,
        // allow user entry?
        allowEntry: true,
        

        postMixInProperties: function() {
            // regex for links
            this._linkRex = /\s(https?:\/\/\S+)|^(https?:\/\/\S+)/g;
        },

        postCreate: function() {
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
            this._loadTemplate(require.toUrl('cowebx/dojo/ChatBox/ChatBox.css'));
            dojo.connect(this, 'onMessage', this, 'onChatMessage');
            if(this.allowEntry){
                this.collab = coweb.initCollab({id : 'Chat'});
                this.collab.subscribeSync('chat.message', this, 'onRemoteChatMessage');
            }else{
                this.collab = coweb.initCollab({id : 'Log'});
                this.collab.subscribeSync('log.message', this, 'onRemoteLogMessage');
                dojo.style(this.entryContainerNode, 'display', 'none');
                dojo.style(this.historyNode, 'bottom', '0px');
            }
            this.collab.subscribeReady(this, 'onCollabReady');
            this.collab.subscribeStateRequest(this, 'onStateRequest');
            this.collab.subscribeStateResponse(this, 'onStateResponse');

            // watch for first focus on chat to hide the prompt message
            var tok = dojo.connect(this.entryNode, 'onfocus', function(event) {
                event.target.style.color = '';
                event.target.value = '';
                dojo.disconnect(tok);
            });
        },
        
        onCollabReady: function(info) {
            // store username for use by widgets
            this.username = info.username;
        },

        onChatMessage: function(text, position, isoDT) {
            var value = {text : text, isoDT : isoDT};
            // send raw value, will be parsed / sanitized on the other side
            this.collab.sendSync('chat.message', value, 'insert', position);
        },
        
        onStateResponse: function(state) {
            this.setHtml(state.html);
        },
        
        onStateRequest: function(token) {
            var state = {
                html : this.getHtml()
            };
            this.collab.sendStateResponse(state, token);
        },
        
        onRemoteChatMessage : function(args) {
            var username = attendance.users[args.site].username;
            // sanitize received text
            args.value.text = this.sanitizeText(args.value.text);
            // parse for http links
            args.value.text = this.parseLinks(args.value.text);
            this.insertMessage(username, args.value.text, 
                args.value.isoDT, args.position);
        },
    
        _insertLogMessage: function(args) {
            // make sure latlng isn't bogus
            var latLng = this.sanitizeText(args.latLng);
            var text = dojo.replace(this.labels[args.template], [latLng]);
            var rv = this.insertMessage(args.username, text, args.isoDT, 
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
        },

        sanitizeText: function(text) {
            return text.replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;');
        },

        parseLinks: function(text) {
            return text.replace(this._linkRex, ' <a href="$1$2" target="_blank">$1$2</a>');
        },

        onMessage: function(text, position, isoDT) {
            // extension point
        },

        _onKeyDown: function(event) {
            if(event.keyCode === dojo.keys.ENTER) {
                // don't send blanks
                if(!this.entryNode.value) {return;}
                // sanitize the entered text
                var text = this.sanitizeText(this.entryNode.value);
                // find and make http links
                text = this.parseLinks(text);
                // build iso datetime string
                var now = new Date();
                var isoDT = dojo.date.stamp.toISOString(now, {zulu: true});
                // insert the message in the history
                var position = this.insertMessage(this.app.username, text, isoDT);
                // invoke extension point
                this.onMessage(this.entryNode.value, position, isoDT);
                // clear the entry box
                this.entryNode.value = '';
            }
        },

        insertMessage: function(username, text, isoDT, position) {
            if(position === undefined) {
                position = dojo.query('div.wChatBoxMessage', this.historyNode).length;
            }
            var msg = dojo.create('div', {className : 'wChatBoxMessage'}, 
                this.historyNode, position);
            var meta = dojo.create('div', {className : 'wChatBoxMessageMeta'}, msg);
            // include username
            if(username) {
                dojo.create('span', {
                    className : 'wChatBoxMessageUsername',
                    innerHTML : this.sanitizeText(username)
                }, meta);
            }

            // build or use the date
            var date;
            if(!isoDT) {
                date = new Date();
                isoDT = dojo.date.stamp.toISOString(date);
            } else {
                date = dojo.date.stamp.fromISOString(isoDT);
            }
            var localTime = dojo.date.locale.format(date,
                {timePattern: 'HH:mm', selector: 'time'});
            dojo.create('span', {
                className : 'wChatBoxMessageTime',
                innerHTML : '@'+localTime,
                title: isoDT
            }, meta);

            // include message text
            dojo.create('span', {
                className : 'wChatBoxMessageText',
                innerHTML : text
            }, msg);
            // scroll to latest message
            msg.scrollIntoView(false);

            return {position : position, isoDT : isoDT};
        },

        setHtml: function(html) {
            // @todo: replace to accept raw chat log for processing to avoid
            //   poisoned state attacks
            this.historyNode.innerHTML = html;
            // adjust timestamps for new locale
            dojo.query('.wChatBoxMessageTime', this.historyNode)
            .forEach(function(item) {
                var date = dojo.date.stamp.fromISOString(item.title);
                var localTime = dojo.date.locale.format(date,
                    {timePattern: 'HH:mm', selector: 'time'});
                item.innerHTML = '@'+localTime;
            });
        },

        getHtml: function() {
            // @todo: replace to return raw chat log for processing to avoid
            //   poisoned state attacks
            return this.historyNode.innerHTML;
        },
        
        _loadTemplate : function(url) {
	        var e = document.createElement("link");
	        e.href = url;
	        e.type = "text/css";
	        e.rel = "stylesheet";
	        e.media = "screen";
	        document.getElementsByTagName("head")[0].appendChild(e);
	    }
	});
});
