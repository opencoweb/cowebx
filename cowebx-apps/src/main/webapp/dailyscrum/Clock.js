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
		if(this.type == 'total'){
			dojo.attr('start','src','images/stop.png');
		}	
    };

	proto.stop = function(){
		this.t.stop();
		this.status = 'stopped';
		if(this.type == 'total'){
			dojo.attr('start','src','images/start.png');
		}
	};
	
	proto.reset = function(){
		this.seconds = (this.time * 60);
	};
	
	proto.addMinute = function(){
		this.seconds = this.seconds + 60;
		this.extraMins++;
		this._renderTime();
	};
	
	proto.notify = function(){
		var anim1 = dojo.animateProperty({
		  				node:"userClockCell",
						duration: 5000,
		  				properties: {
		      				backgroundColor: 'red'
		  				}
					});
		var anim2 = dojo.animateProperty({
					  	node:"userClockCell",
						duration: 5000,
					  	properties: {
					    	backgroundColor: 'rgb(197, 204, 211)'
					  	}
					});
		dojo.fx.chain([anim1,anim2]).play();
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
		
		if((this.type == 'total') && (this.seconds == 0))
			this.stop();
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