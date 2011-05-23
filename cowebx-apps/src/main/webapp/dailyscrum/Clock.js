define([
    'coweb/main',
	'dojox/timing'
], function(coweb) {
    var Clock = function(args) {
		//Params
        this.id = args.id;
        if(!this.id) {
            throw new Error('missing id argument');
        }

		//Sync stuff
		this.site = null;
        this.collab = coweb.initCollab({id : this.id});  
        this.collab.subscribeReady(this, 'onReady');
		
		//Clock stuff
		this.time = args.time
		this.test = "pos";
		this.seconds = (args.time * 60);
		this.t = new dojox.timing.Timer(1000);
		dojo.connect(this.t, 'onTick', this, '_onTick');
		this.t.start();
    };
    var proto = Clock.prototype;
    
    proto.onReady = function(params) {
        this.site = params.site;
    };

    proto.start = function() {
        this.t.start();
    };

	proto.stop = function(){
		this.t.stop();
	};
	
	proto.reset = function(){
		this.seconds = (this.time * 60);
	};
	
	proto._onTick = function() {
		
		if(this.seconds == 0)
			this.test = "neg";
		if(this.test == "pos")
			this.seconds--;
		if(this.test == "neg")
			this.seconds++;
			
		var min = "0"+Math.floor(this.seconds/60);
		var secs = this.seconds%60;
		if(this.test == "neg")
			min = "-"+min;
		if(secs<10)
			secs = "0"+secs;
		dojo.attr('userClock','innerHTML',  min + ":" + secs);
    };
	
    return Clock;
});