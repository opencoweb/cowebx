define(['dijit/form/Slider','dijit/form/TextBox'], function() {
    var TimeSlider = function(args){
        if(!args.domNode || !args.textarea)
            throw new Error('Slider: missing argument');
        this.domNode = args.domNode;
        this.build(args.domNode);
        this.history = [];
        this._textarea = args.textarea;
        this.sliderShowing = false;
        this.index = null;
        this.div = args.div;
        dojo.subscribe("editorHistory", dojo.hitch(this, function(message){
             this.history.push(message.save);
        }));
        dojo.subscribe("sliderToggle", dojo.hitch(this, function(message){
             this._toggle();
        }));
    };
    var proto = TimeSlider.prototype;
    
    proto.build = function(){
        var slider = new dijit.form.HorizontalSlider({
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
        this.domNode);
        var play = dojo.create('a',{innerHTML:'Go', 'class':'go'});
    };
    
    proto._onChange = function(value) {
        this.index = n;
        var p = value;
        var n = Math.floor((this.history.length-1)*p);
        var state = this.history[n];
        if(state){
            this._textarea.value.string = state;
            this._textarea.render(true);
        }
    };
    
    proto._toggle = function(){
        if(!this.sliderShowing){
            this.sliderShowing = true;
            dojo.fadeIn({node:'sliderHolder'}).play();
        }else{
            this.sliderShowing = false;
            dojo.fadeOut({node:'sliderHolder'}).play();
        }
    }
    
    return TimeSlider;
});