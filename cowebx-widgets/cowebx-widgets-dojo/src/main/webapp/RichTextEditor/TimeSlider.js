define(['coweb/main','dijit/form/Slider','dijit/form/TextBox'], function(coweb) {
    var TimeSlider = function(args){
        if(!args.domNode || !args.textarea || !args.id || !args.parent)
            throw new Error('Slider: missing argument');
        
        //1. Process args
        this.domNode            =   args.domNode;
        this.id                 =   args.id;
        this.parent             =   args.parent;
        this.history            =   [];
        this.sliderShowing      =   false;
        this.index              =   null;
        this._textarea          =   args.textarea;
        this._i                 =   null;
        
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
        this.slider = new dijit.form.HorizontalSlider({
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
        var play = dojo.create('a',{'class':'go',innerHTML:'Play'},this._buttonCell); 
        var reset = dojo.create('a',{'class':'go',innerHTML:'Revert'},this._buttonCell);
        dojo.connect(play, 'onclick', this, 'play'); 
        dojo.connect(reset, 'onclick', this, 'reset');
        this.history.push(dojo.clone(this._textarea.value));
    };
    
    proto.reset = function(obj){
        if(obj && obj.value){
            this.parent.oldSnapshot = obj.value.oldSnapshot;
            this._textarea.value.string = obj.value.string;
            this._textarea.render();
            this.history = obj.value.history;
        }else{
            this.history = this.history.slice(0, this.index+1);
            this.collab.sendSync('editorReset',{
                string: this._textarea.value.string,
                oldSnapshot: this.parent.oldSnapshot,
                history : this.history
            });
        }
        this._onBlur();
    };
    
    proto.play = function(){
        if(!this._i)
            this._i = this.index;
        if(this._i < this.history.length){
            var state = this.history[this._i];
            if(state){
                this._textarea.value = state;
                this._textarea.render(true);
                this._textarea.getCharObj(true);
                this.slider.destroy();
                var h = dojo.create('div',{style:'width:100%;height:100%'},this._sliderCell);
                this.slider = new dijit.form.HorizontalSlider({
                    name: "slider",
                    value: this._i/(this.history.length-1),
                    minimum: 0,
                    maximum: 1,
                    intermediateChanges: true,
                    style: "width:100%;",
                    onChange: dojo.hitch(this, function(value) {
                        this._onChange(value);
                    })
                },h);
            }
            this._i++;
            setTimeout(dojo.hitch(this, 'play'), 50);
        }else{
            this._i=null;
            this._onBlur();
            this._textarea.div.focus();
        }
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
            this._textarea.getCharObj(true);
        }
    };
    
    proto._onBlur = function() {
        // this.index = this.history.length-1;
        //         var state = this.history[this.index];
        //         if(state){
        //             this._textarea.value.string = state.string;
        //             this._textarea.render(true);
        //             this._textarea.getCharObj(true);
        //             this.slider.destroy();
        //             var h = dojo.create('div',{style:'width:100%;height:100%'},this._sliderCell);
        //             this.slider = new dijit.form.HorizontalSlider({
        //                 name: "slider",
        //                 value: 1,
        //                 minimum: 0,
        //                 maximum: 1,
        //                 intermediateChanges: true,
        //                 style: "width:100%;",
        //                 onChange: dojo.hitch(this, function(value) {
        //                     this._onChange(value);
        //                 })
        //             },h);
        //         }else{
        //             this.slider.destroy();
        //             var h = dojo.create('div',{style:'width:100%;height:100%'},this._sliderCell);
        //             this.slider = new dijit.form.HorizontalSlider({
        //                 name: "slider",
        //                 value: 1,
        //                 minimum: 0,
        //                 maximum: 1,
        //                 intermediateChanges: true,
        //                 style: "width:100%;",
        //                 onChange: dojo.hitch(this, function(value) {
        //                     this._onChange(value);
        //                 })
        //             },h);
        //         }
        this.parent.on = true;
    };
    
    proto._toggle = function(){
        var button = this._textarea.sliderButton;
        if(!this.sliderShowing){
            this.sliderShowing = true;
            dojo.attr(button.domNode, 'style', 'border-bottom:3px solid red;');
            dojo.style(button.domNode, 'float', 'right');
            dojo.fadeIn({node:'sliderHolder'}).play();
        }else{
            dojo.attr(button.domNode, 'style', 'border-bottom:3px solid black');
            dojo.style(button.domNode, 'float', 'right');
            this.sliderShowing = false;
            dojo.fadeOut({node:'sliderHolder'}).play();
        }
    };
    
    proto._connect = function(){
        this.collab = coweb.initCollab({id : this.id}); 
        this.collab.subscribeSync('editorReset', this, 'reset');
        // dojo.connect(this._textarea.div,'onclick',this,function(){
        //     this._onBlur();
        // });
        dojo.subscribe("editorHistory", dojo.hitch(this, function(message){
             this.history.push(message.save);
        }));
        dojo.subscribe("sliderToggle", dojo.hitch(this, function(message){
             this._toggle();
        }));
    };
    
    return TimeSlider;
});