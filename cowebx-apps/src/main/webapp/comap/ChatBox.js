define([
    'dojo',
	"dojo/_base/declare", // declare
	"dijit/_Widget",
	"dijit/_TemplatedMixin",
	"dijit/_Contained",
	"dojo/text!./templates/ChatBox.html",
	'dojo/date/locale',
	'dojo/date/stamp'
], function(dojo, declare, _Widget, _TemplatedMixin, _Contained, template){

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
            if(!this.allowEntry) {
                dojo.style(this.entryContainerNode, 'display', 'none');
                dojo.style(this.historyNode, 'bottom', '0px');
            }
            // watch for first focus on chat to hide the prompt message
            var tok = dojo.connect(this.entryNode, 'onfocus', function(event) {
                event.target.style.color = '';
                event.target.value = '';
                dojo.disconnect(tok);
            });
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
                item.innerHTML = '@123'+localTime;
            });
        },

        getHtml: function() {
            // @todo: replace to return raw chat log for processing to avoid
            //   poisoned state attacks
            return this.historyNode.innerHTML;
        }
	});
});
