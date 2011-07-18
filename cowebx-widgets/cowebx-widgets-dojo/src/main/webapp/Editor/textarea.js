define([], function() {
    var textarea = function(args){
        //Check for req'd properties
        if(!args.domNode)
            throw new Error("textarea.js: missing domNode param");

        //Build stuff
        this.div = dojo.create('div', {tabindex:0,id:'thisDiv'}, args.domNode);
        this.before = dojo.create('span',{id:'before'},this.div,'first');
        this.after = dojo.create('span',{id:'after'},this.div,'last');
        this.caret = dojo.create('span', {id:'caret',style:'background:black;visibility:hidden;', innerHTML:'|'},'before','after');
        this.caretTimer = setInterval(dojo.hitch(this, '_blink'), 500);
        
        //Do stuff
        this._style();
        this._connect();
        
        //Properties
        this.displayCaret = false;
        this.domNode = args.domNode;
        this.value = {start:0,end:0,string:''};
        this.newLine = '^';
        this.newSpace = ' ';
        this.cancelKeys = {
            9  : 'tab',
            27 : 'esc',
            91 : 'meta',
            18 : 'option',
            17 : 'control'
        }
    };
    var proto = textarea.prototype;
    
    proto.onKeyPress = function(e) {
        var lock = false;
        //Special actions for certain key-catches
        if(e.keyCode == 37){
            this.moveCaretLeft();    
        }else if(e.keyCode == 39){
            this.moveCaretRight();
        }else if(e.keyCode == 13){
            this.insertChar(this.newLine); 
        }else if(e.charCode == 32){
            this.insertChar(this.newSpace); 
        }else if(e.keyCode == 38){
            this.moveCaretUp();
        }else if(e.keyCode == 40){
            this.moveCaretDown();
        }else if(e.keyCode == 8){
            this.deleteChar(e);
        }else if(this.cancelKeys[e.keyCode]){  

        }else{
            this.insertChar(String.fromCharCode(e.which));
        }
        
        this.lineWidth = this.getWidthInChars();

        return false;
    };
    
    proto.render = function() {
        var s=[];
        var before='';
        var test = this.value.string.substring(0, this.value.start);
        for(var i=0; i<test.length; i++){
            if(test[i]==this.newLine){
                s.push('<br>');
            }else if(test[i]==this.newSpace){
                s.push('<span>&nbsp;</span>');
            }else{
                s.push('<span>'+test[i]+'</span>');
            }
        }
        for(var j=0; j<s.length; j++){
            before = before + s[j];
        }
        
        var t=[];
        var after='';
        var test2 = this.value.string.substring(this.value.start, this.value.string.length);
        for(var k=0; k<test2.length; k++){
            if(test2[k]==this.newLine){
                t.push('<br>');
            }else if(test2[k]==this.newSpace){
                t.push('<span>&nbsp;</span>');
            }else{
                t.push('<span>'+test2[k]+'</span>');
            }
        }
        for(var l=0; l<t.length; l++){
            after = after + t[l];
        }
        
        this.before.innerHTML = before;
        this.after.innerHTML = after;
        
        
        // var b = this._replaceAll(this.value.string.substring(0,this.value.start), this.newLine, '<br>');
        // var bb = this._replaceAll(b, this.newSpace, '&nbsp; ');
        // var a = this._replaceAll(this.value.string.substring(this.value.start,this.value.string.length), this.newLine, '<br>');
        // var aa = this._replaceAll(a, this.newSpace, '&nbsp; ');
        // 
        // this.before.innerHTML = bb;
        // this.after.innerHTML = aa;
    };
    
    proto.getWidthInChars = function(){
        this.rows = {};
        var currY = 0;
        var row = 0;
        var count = 0;
        var lineHeight = parseFloat(window.getComputedStyle(this.before).lineHeight.replace('px',''));
        dojo.query("#thisDiv span, br").forEach(dojo.hitch(this, function(node, index, arr){
            var pos = this.findPos(node);
            if(pos.top > currY){
                currY = pos.top;
                row++;
                count=0;
            }else{
                if(node.id != 'caret'){
                    count++;
                }
            }
            this.rows[row] = count;
            if(node.id == 'caret'){
                this.currLine = row;
                this.currLineIndex = count;
            }
        }));
        this.rows[1] = this.rows[1]-1;
    };
    
    proto.insertChar = function(c) {
        var v = this.value
        this.value.string = v.string.substring(0,v.start)+c+v.string.substring(v.start,v.string.length);
        this.value.start++;
        this.render();
    };
    
    proto.deleteChar = function() {
        var v = this.value;
        var beforeLength = this.value.string.length+0;
        this.value.string = v.string.substring(0,v.start-1)+v.string.substring(v.start,v.string.length);
        var afterLength = this.value.string.length+0;
        if(beforeLength != afterLength)
            this.value.start--;
        this.render();
    };
    
    proto.moveCaretUp = function() {
        console.log(this.currLineIndex);
        console.log(this.rows);
    };
    
    proto.moveCaretDown = function() {
        console.log(this.currLineIndex);
        console.log(this.rows);
    };
    
    proto.moveCaretLeft = function() {
        if(this.value.start>0)
            this.value.start--;
        this.render();
    };
    
    proto.moveCaretRight = function() {
        if(this.value.start<this.value.string.length)
            this.value.start++;
        this.render();
    };
    
    proto.moveCaretTo = function(pos) {
        if(pos < 0){
            this.value.start = 0;
        }else if(pos > this.value.string.length){
            this.value.start = this.value.string.length;
        }else if(pos <= this.value.string.length){
            this.value.start = pos;
        }
        this.render();
    };
    
    proto.getValue = function() {
        return this.value.string;
    };
    
    proto._style = function(){
        dojo.attr(this.div, 'style', 'word-wrap:break-word;');
        dojo.style(this.div, 'width', '100%');
        dojo.style(this.div, 'height', '100%');
        dojo.style(this.div, 'background', 'white');
    };
    
    proto._connect = function(){
        dojo.connect(this.div, 'onfocus', this, '_onFocus');
        dojo.connect(this.div, 'onblur', this, '_onBlur');
        dojo.connect(this.div, 'onkeypress', this, 'onKeyPress');
        document.onkeydown = this._overrideKeys;
    };
    
    proto._onFocus = function(){
        this.displayCaret = true;
        this._currY = this.findPos(this.caret).top;
    };
    
    proto._onBlur = function(){
        this.displayCaret = false;
    };
    
    proto._blink = function(){
        if(this.displayCaret){
            if(dojo.style(this.caret, 'visibility') == 'hidden'){
                dojo.style(this.caret, 'visibility', 'visible');
            }else if(dojo.style(this.caret, 'visibility') == 'visible'){
                dojo.style(this.caret, 'visibility', 'hidden');
            }
        }
    };
    
    proto._overrideKeys = function(e) {
        //Backspace
        if (e.which == 8){
			return false;
        }
    };
    
    proto._stripTags = function (string) {
       return string.replace(/<([^>]+)>/g,'');
    }
    
    proto._replaceAll = function(string, pattern, w) {
        var tmp = [];
        for(var i=0; i<string.length; i++){
            var c = string[i];
            if(c==pattern)
                c = w;
            tmp.push(c);
        }
        var s = '';
        for(var j=0; j<tmp.length; j++){
            s = s+tmp[j];
        }
        return s;
    };
    
    proto.findPos = function(obj) {
    	var curleft = curtop = 0;
    	if (obj.offsetParent) {
    		curleft = obj.offsetLeft
    		curtop = obj.offsetTop
    		while (obj = obj.offsetParent) {
    			curleft += obj.offsetLeft
    			curtop += obj.offsetTop
    		}
    	}
    	return {left:curleft, top:curtop};
    };

    return textarea;
});