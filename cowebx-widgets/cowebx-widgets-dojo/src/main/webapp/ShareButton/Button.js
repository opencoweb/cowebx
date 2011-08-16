define([], function() {
    var Button = function(args){
        if(!args.domNode || !args.id || !args.listenTo)
            throw new Error('ShareButton: missing argument');
            
        //1.Process args
        this.id                 =   args.id;            //This widget's id
        this.domNode            =   args.domNode;       //DOMnode to attach to
        this.listenTo           =   args.listenTo;      //DOMnode to listen to or 'share'
        this.displayButton      =   (args.displayButton == null) ? true : args.displayButton;
        this.shareShowing       =   false;              //Is dialog open
        
        //2. Connect and style stuff
        this._loadStylesheet('../lib/cowebx/dojo/ShareButton/textarea.css');
        this._connect();
        this._buildShareButton();
    };
    var proto = Button.prototype;

    proto.onShareClick = function(e) {
        if(this.shareShowing == false){
            this.shareShowing = true;
            dojo.style('sendBox','display','block')
            dojo.fadeIn({node:'sendBox'}).play();
        }else{
            this._hide();
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
            var messageHTML = '&MessageHTML='+this._formatShareMsg();
            var options = '&Options=';
            var base = 'http://api.jangomail.com/api.asmx/SendTransactionalEmail?';
            this._loadScript(base+username+password+fromName+fromEmail+toEmail+subject+messagePlain+messageHTML+options);
            dojo.fadeOut({node:'sendBox'}).play();
        }
    };
    
    proto._buildShareButton = function() {
        this.shareButton = dojo.create('a',{innerHTML:'share', 'class':'share', id:'shareButton'},this.domNode,'before');
        if(this.displayButton == false)
            dojo.style(this.shareButton, 'display', 'none');
        dojo.connect(this.shareButton, 'onclick', this, 'onShareClick');
        this.emailBox = dojo.create('div',{innerHTML:'email to send to:<br>','class':'emailBox',id:'sendBox'},this.shareButton,'after');
        this.emailInput = dojo.create('input',{type:'text',id:'sendInput'},this.emailBox,'last');
        dojo.connect(this.emailInput, 'onkeypress', this, function(e){
            if(e.keyCode == 8)
                e.target.value = '';
        });
        this.sendButton = dojo.create('a',{innerHTML:'send', 'class':'send'}, this.emailInput, 'after');
        dojo.connect(this.sendButton, 'onclick', this, 'onSendClick');
    };
    
    proto._hide = function(){
        if(this.shareShowing == true){
            this.shareShowing = false;
            dojo.fadeOut({node:'sendBox'}).play();
            setTimeout("dojo.style('sendBox','display','none')",1000);
        }
    };
    
    proto._connect = function() {
        dojo.subscribe("shareClick", dojo.hitch(this, function(message){
             this.onShareClick();
        }));
        dojo.subscribe("shareHide", dojo.hitch(this, function(message){
             this._hide();
        }));
    };
    
    proto._formatShareMsg = function(){
        var date = new Date();
        var title = '<strong><span style="font-size:14px">OpenCoweb Document</span><br><br>';
        var time = 'Shared at:<br></strong>'+date+'<br><br>';
        var doc = '<strong>Document:<br></strong>'+this.listenTo._getCleanValueAttr();
        return title+time+doc;
    };
    
    proto._loadStylesheet = function(url) {
       var e = document.createElement("link");
       e.href = url;
       e.type = "text/css";
       e.rel = "stylesheet";
       e.media = "screen";
       document.getElementsByTagName("head")[0].appendChild(e);
    };
    
    proto._loadScript = function(url) {
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