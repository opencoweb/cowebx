define([], function() {
    var Button = function(args){
        this.load_template('../lib/cowebx/dojo/ShareButton/textarea.css');
        this.id = args.id;
        this.domNode = args.domNode;
        this.shareShowing = false;
        this.listenTo = args.listenTo;
        
        if(!this.domNode)
            throw new Error('missing node argument');
        if(!this.id)
            throw new Error('missing id argument');
        if(!this.listenTo)
            throw new Error('missing listenTo argument');
        
        this._buildShareButton();
    };
    var proto = Button.prototype;
    
    proto._buildShareButton = function() {
        this.shareButton = dojo.create('a',{innerHTML:'share', 'class':'share', id:'shareButton'}, this.domNode, 'before');
        dojo.connect(this.shareButton, 'onclick', this, 'onShareClick');
        this.emailBox = dojo.create('div',{innerHTML:'email to send to:<br>','class':'emailBox',id:'sendBox'},this.shareButton,'after');
        this.emailInput = dojo.create('input',{type:'text',id:'sendInput'},this.emailBox,'last');
        this.sendButton = dojo.create('a',{innerHTML:'send', 'class':'send'}, this.emailInput, 'after');
        dojo.connect(this.sendButton, 'onclick', this, 'onSendClick');
    };
    
    proto.onShareClick = function(e) {
        if(this.shareShowing == false){
            this.shareShowing = true;
            dojo.fadeIn({node:'sendBox'}).play();
        }else{
            dojo.fadeOut({node:'sendBox'}).play();
        }
    };
    
    proto.onSendClick = function(e) {
        var email = dojo.byId('sendInput').value;
        if(email != ''){
            var username = 'Username=opencoweb';
            var password = '&Password=777132XK';
            var fromName = '&FromName=OpenCoweb';
            var fromEmail = '&FromEmail=opencoweb@us.ibm.com';
            var toEmail = '&ToEmailAddress='+email;
            var subject = '&Subject=OpenCoweb Document';
            var messagePlain = '&MessagePlain=';
            var messageHTML = '&MessageHTML='+this.formatShareMsg();
            var options = '&Options=';
            var base = 'http://api.jangomail.com/api.asmx/SendTransactionalEmail?';
            this.load_script(base+username+password+fromName+fromEmail+toEmail+subject+messagePlain+messageHTML+options);
            dojo.fadeOut({node:'sendBox'}).play();
        }
    };
    
    proto.formatShareMsg = function(){
        var date = new Date();
        
        var title = '<strong><span style="font-size:14px">OpenCoweb Document</span><br><br>';
        var time = 'Shared at:<br></strong>'+date+'<br><br>';
        var doc = '<strong>Document:<br></strong>'+this.listenTo.value;
        return title+time+doc;
    };
    
    proto.load_template = function(url) {
       var e = document.createElement("link");
       e.href = url;
       e.type = "text/css";
       e.rel = "stylesheet";
       e.media = "screen";
       document.getElementsByTagName("head")[0].appendChild(e);
    };
    
    proto.load_script = function(url) {
        var script_id = null;
        var script = document.createElement('script');
        script.setAttribute('type', 'text/javascript');
        script.setAttribute('src', url);
        script.setAttribute('id', 'script_id');

        script_id = document.getElementById('script_id');
        if(script_id){
            document.getElementsByTagName('head')[0].removeChild(script_id);
        }

        // Insert <script> into DOM
        document.getElementsByTagName('head')[0].appendChild(script);
    };
    
    

    return Button;
});