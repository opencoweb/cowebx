define(['dojo'], function(dojo) {
    var ShareButton = function(args){
        if(!args.domNode || !args.id || !args.listenTo)
            throw new Error('ShareButton: missing argument');
            
        //1.Process args
        this.id                 =   args.id;            //This widget's id
        this.domNode            =   args.domNode;       //DOMnode to attach to
        this.listenTo           =   args.listenTo;      //DOMnode to listen to or 'share'
        this.displayButton      =   (args.displayButton == null) ? true : args.displayButton;
        this.shareShowing       =   false;              //Is dialog open
        
        //2. Connect things
        this._connect();
        
        //3. Render
        this.render();
    };
    var proto = ShareButton.prototype;
    
    proto.render = function() {
        //Build share button (in case not linked with toolbar)
        this.shareButton = dojo.create('a',{innerHTML:'share', 'class':'shareButton', id:'shareButton'},this.domNode,'before');
        if(this.displayButton == false)
            dojo.style(this.shareButton, 'display', 'none');
        dojo.connect(this.shareButton, 'onclick', this, 'toggle');
        
        //Build email box
        this.emailBox = dojo.create('div',{innerHTML:'email to send to:<br>','class':'emailBox',style:'display:none;',id:'sendBox'},this.shareButton,'after');
        this.emailInput = dojo.create('input',{type:'text',id:'sendInput'},this.emailBox,'last');
        
        //Build send button
        this.sendButton = dojo.create('a',{innerHTML:'send', 'class':'sendButton', id:'sendButton'}, this.emailInput, 'after');
        this.closeButton = dojo.create('a',{innerHTML:'close', 'class':'sendButton', id:'sendButton'}, this.sendButton, 'after');
        dojo.connect(this.sendButton, 'onclick', this, 'send');
        dojo.connect(this.closeButton, 'onclick', this, '_hide');
    };

    proto.toggle = function(e) {
        if(this.shareShowing == false){
            this.shareShowing = true;
            dojo.style('sendBox','display','block');
            this.emailInput.focus();
        }else{
            this._hide();
        }
    };
    
    proto.send = function(e) {
        console.log('send');
        var email = dojo.byId('sendInput').value;
        if(email != ''){
            var username = 'Username=paboucho';
            var password = '&Password=opencoweb';
            var fromName = '&FromName=OpenCoweb';
            var fromEmail = '&FromEmail=opencoweb@us.ibm.com';
            var toEmail = '&ToEmailAddress='+email;
            var subject = '&Subject=OpenCoweb Document';
            var messagePlain = '&MessagePlain=';
            var messageHTML = '&MessageHTML='+this._formatShareMsg();
            var options = '&Options=';
            var base = 'http://api.jangomail.com/api.asmx/SendTransactionalEmail?';
			this._loadScript(base+username+password+fromName+fromEmail+toEmail+subject+messagePlain+messageHTML+options);
            this._hide();
        }
    };
    
    proto._hide = function(){
        if(this.shareShowing == true){
            this.shareShowing = false;
            dojo.style('sendBox','display','none');
        }
    };
    
    proto._connect = function() {
        dojo.subscribe("shareClick", dojo.hitch(this, function(message){ this.toggle(); }));
        dojo.subscribe("hideAll", dojo.hitch(this, function(message){ this._hide(); }));
    };
    
    proto._formatShareMsg = function(){
        var date = new Date();
        var title = '<strong><span style="font-size:14px">OpenCoweb Document</span><br><br>';
        var time = 'Shared at:<br></strong>'+date+'<br><br>';
        var doc = '<strong>Document:<br></strong>'+this.listenTo.innerHTML;
        return title+time+doc;
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

    return ShareButton;
});