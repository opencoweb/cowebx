define([
    'coweb/main',
	'dojox/timing'
], function(coweb) {
    var Clock = function(args) {
		//Params
		this.site = null;
        this.id = args.id;
		this.type = args.type;
		if(!this.id || !this.type) 
            throw new Error('missing id or type argument');
		
		//Clock vars
		this.time = args.time;				//Original time (in mins)
		this.status = 'stopped';			//Timer status
		this.test = "pos";					//Positive or negative?
		this.seconds = (args.time * 60);	//Current time (in secs)
		this.extraMins = 0;					//Current speaker's extra mins
		this.mods = [];
		
		//Timer initialization
		this.t = new dojox.timing.Timer(1000);
		dojo.connect(this.t, 'onTick', this, '_onTick');
		this._renderTime();
    };
    var proto = Clock.prototype;
    
    proto.onReady = function(params) {
        this.site = params.site;
    };

    proto.start = function() {
		this._renderTime();
        this.t.start();
		this.status = 'started';	
    };

	proto.stop = function(){
		this.t.stop();
		this.status = 'stopped';
	};
	
	proto.reset = function(){
		this.seconds = (this.time * 60);
	};
	
	proto.addMinute = function(){
		this.seconds = this.seconds + 60;
		this.extraMins++;
	};
	
	proto.notify = function(){
		dojo.style([this.type]+'Clock', 'color', 'red');
	};
	
	proto.unNotify = function(){
		dojo.style([this.type]+'Clock', 'color', 'grey');
	};
	
	proto._onTick = function() {
		if(this.seconds == 0)
			this.test = "neg";
		if(this.test == "pos")
			this.seconds--;
		if(this.test == "neg"){
			this.seconds++;
			this.notify();
		}
		this._renderTime();
    };
	
	proto._renderTime = function(){
		var min = Math.floor(this.seconds/60);
		if(min < 10)
			min = "0"+min;
		if(this.test == "neg")
			min = "-"+min;
		var secs = this.seconds%60;
		if(secs<10)
			secs = "0"+secs;
		dojo.attr(this.type+'Clock','innerHTML',  min + ":" + secs);
	}
	
    return Clock;
});