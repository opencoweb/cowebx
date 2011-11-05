define([
    'dojo',
    'dojo/date/locale',
    'dojo/date/stamp'
], function(dojo) {
    var ChatBox = function(args) {
        if(!args.domNode || !args.app)
		    throw new Error('ChatBox: missing domNode or app argument');
        // application controller
        this.app = args.app;
        // allow user entry?
        this.allowEntry = (!args.allowEntry) ? false : args.allowEntry;
        // figure out if we are map log or chat
        this.func = args.domNode;
        // widget template
        this.template = '';
        dojo.xhrGet({
			url: 'templates/'+this.func+'Box.html',
			handleAs: 'text',
			load: dojo.hitch(this, function(data){ 
                this.template = data;
                dojo.byId(args.domNode).innerHTML = this.template;
                this.postCreate();
			}),
			error: function(error) { console.log(error); }
		});
    };
    var proto = ChatBox.prototype;

    proto.postCreate = function() {
        // regex for links
        this._linkRex = /\s(https?:\/\/\S+)|^(https?:\/\/\S+)/g;
        //Hide or show entry node
        if(!this.allowEntry) {
            dojo.style(dojo.byId(this.func+'EntryContainerNode'), 'display', 'none');
            dojo.style(dojo.byId(this.func+'HistoryNode'), 'bottom', '0px');
        }
        // watch for first focus on chat to hide the prompt message
        var tok = dojo.connect(dojo.byId(this.func+'EntryNode'), 'onfocus', function(e) {
            if(e.target.style){
                e.target.style.color = '';
                e.target.value = '';
                dojo.disconnect(tok);
            }
        });
        
        //Connect to events
        dojo.connect(dojo.byId('entrNode'),'onkeydown',this,'_onKeyDown');
    };
    
    proto.sanitizeText = function(text) {
        return text.replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
    };
    
    proto.parseLinks = function(text) {
        return text.replace(this._linkRex, ' <a href="$1$2" target="_blank">$1$2</a>');
    };
    
    proto.onMessage = function(text, position, isoDT) {
        // extension point
    };

    proto._onKeyDown = function(event) {
        if(event.keyCode === dojo.keys.ENTER) {
            // don't send blanks
            if(!dojo.byId(this.func+'EntryNode').value) {return;}
            // sanitize the entered text
            var text = this.sanitizeText(dojo.byId(this.func+'EntryNode').value);
            // find and make http links
            text = this.parseLinks(text);
            // build iso datetime string
            var now = new Date();
            var isoDT = dojo.date.stamp.toISOString(now, {zulu: true});
            // insert the message in the history
            var position = this.insertMessage(this.app.username, text, isoDT);
            // invoke extension point
            this.onMessage(dojo.byId(this.func+'EntryNode').value, position, isoDT);
            // clear the entry box
            dojo.byId(this.func+'EntryNode').value = '';
        }
    };

    proto.insertMessage = function(username, text, isoDT, position) {
        if(position === undefined) {
            position = dojo.query('div.wChatBoxMessage', dojo.byId(this.func+'HistoryNode')).length;
        }
        var msg = dojo.create('div', {className : 'wChatBoxMessage'}, 
            dojo.byId(this.func+'HistoryNode'), position);
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
    };
    
    proto.setHtml = function(html) {
        // @todo: replace to accept raw chat log for processing to avoid
        //   poisoned state attacks
        dojo.byId(this.func+'HistoryNode').innerHTML = html;
        // adjust timestamps for new locale
        dojo.query('.wChatBoxMessageTime', dojo.byId(this.func+'HistoryNode'))
        .forEach(function(item) {
            var date = dojo.date.stamp.fromISOString(item.title);
            var localTime = dojo.date.locale.format(date,
                {timePattern: 'HH:mm', selector: 'time'});
            item.innerHTML = '@123'+localTime;
        });
    };
    
    proto.getHtml = function() {
        // @todo: replace to return raw chat log for processing to avoid
        //   poisoned state attacks
        return dojo.byId(this.func+'HistoryNode').innerHTML;
    };
    
    return ChatBox;
});