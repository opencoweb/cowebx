define([
    'dojo',
    'dijit/registry',
    'coweb/main',
    'dijit/form/HorizontalSlider'
], function(dojo, dijit, coweb, Slider) {
    var TimeSlider = function(args){
        if(!args.domNode || !args.textarea || !args.id || !args.parent)
            throw new Error('Slider: missing argument');
        
        //1. Process args
        this.domNode            =   args.domNode;
        this.id                 =   args.id;
        // this.parent             =   args.parent;
        // this.history            =   [];
        // this.sliderShowing      =   false;
        // this.index              =   null;
        // this._textarea          =   args.textarea;
        // this._i                 =   null;
        
        //2. Connect stuff
        this.build(args.domNode);
        this._connect();
    };
    var proto = TimeSlider.prototype;
    
    proto.build = function(){
        var table = dojo.create('table',{'class':'sliderTable'},this.domNode);
        var row = dojo.create('tr',{},table);
        this._sliderCell = dojo.create('td',{'class':'sliderCell'},row,'first');
        var h = dojo.create('div',{style:'width:100%;height:100%'},this._sliderCell);
        this._buttonCell = dojo.create('td',{'class':'buttonCell'},row,'last');
        this.slider = new Slider({
            name: "slider",
            value: 1,
            minimum: 0,
            maximum: 1,
            intermediateChanges: true,
            style: "width:100%;",
            onChange: dojo.hitch(this, function(value) {
                this._onChange(value);
            })
        },
        h);
        //var play = dojo.create('a',{'class':'sliderButton',innerHTML:'Play'},this._buttonCell); 
        //dojo.connect(play, 'onclick', this, 'play'); 
        var reset = dojo.create('a',{'class':'sliderButton',innerHTML:'Revert'},this._buttonCell);
        dojo.connect(reset, 'onclick', this, 'reset');
        //this.history.push(dojo.clone(this._textarea.value));
    };
    
    proto.reset = function(){
        this.history = this.history.slice(0, this.index+1);
        this.collab.sendSync('editorReset',{
            string: this._textarea.value.string,
            history : this.history
        });
        this._reRenderSlider();
    };
    
    proto.remoteReset = function(obj){
        var t = this._textarea;
        if(t.value.start > obj.value.string.length)
            t.value.start = obj.value.string.length;
        if(t.value.end > obj.value.string.length)
            t.value.end = obj.value.string.length;
        t.value.string = obj.value.string;
        this.history = obj.value.history;
        this._reRenderSlider();
        t.render(true);
    };
    
    proto.play = function(){
        
    };
    
    proto._reRenderSlider = function(){
        this.slider.destroy();
        var h = dojo.create('div',{style:'width:100%;height:100%'},this._sliderCell);
        this.slider = new Slider({
            name: "slider",
            value: 1,
            minimum: 0,
            maximum: 1,
            intermediateChanges: true,
            style: "width:100%;",
            onChange: dojo.hitch(this, function(value) {
                this._onChange(value);
            })
        },h);
        this.parent.on = true;
    };
    
    proto._onChange = function(value) {
        this.parent.on = false;
        var p = value;
        var n = Math.floor((this.history.length-1)*p);
        this.index = n;
        var state = this.history[n];
        if(state){
            this._textarea.value = state;
            this._textarea.render(true);
        }
    };
    
    proto._toggle = function(){
        var button = this._textarea.sliderButton;
        if(!this.sliderShowing){
            this.sliderShowing = true;
            dojo.attr(button.domNode, 'style', 'border-bottom:3px solid red;');
            dojo.style(button.domNode, 'float', 'right');
            dojo.style('sliderHolder', 'display', 'block');
        }else{
            this._hide();
        }
    };
    
    proto._hide = function(){
        var button = this._textarea.sliderButton
        if(button){
            this.sliderShowing = false;
            dojo.attr(button.domNode, 'style', 'border-bottom:3px solid black');
            dojo.style(button.domNode, 'float', 'right');
            dojo.style('sliderHolder', 'display', 'none');
            this.index = this.history.length-1;
            if(this.history[this.index-1]){
                this._textarea.value = this.history[this.index];
                this._textarea.render();
            }
        }
    };
    
    proto._connect = function(){
        this.collab = coweb.initCollab({id : this.id}); 
        dojo.subscribe("hideAll", dojo.hitch(this, function(message){ this._hide(); }));
        this.collab.subscribeSync('editorReset', dojo.hitch(this, function(obj){
            this.remoteReset(obj);
        }));
        dojo.subscribe("editorHistory", dojo.hitch(this, function(message){
             this.history.push(message.save);
        }));
        dojo.subscribe("sliderToggle", dojo.hitch(this, function(message){
             this._toggle();
        }));
    };
    
    return TimeSlider;
});