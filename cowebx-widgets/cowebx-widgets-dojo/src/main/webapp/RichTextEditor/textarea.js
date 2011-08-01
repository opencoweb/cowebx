define(['./zeroclipboard/ZeroClipboard.js'], function() {
    var textarea = function(args){
        //Check for req'd properties
        if(!args.domNode)
            throw new Error("textarea.js: missing domNode param");

        //Build divs & spans (caret)
        this.div = dojo.create('div', {tabindex:-1,id:'thisDiv'}, args.domNode);
        this.before = dojo.create('span',{id:'before'},this.div,'first');
        this.selection = dojo.create('span',{id:'selection'},this.div,'last');
        this.after = dojo.create('span',{id:'after'},this.div,'last');
        
        //Save space
        this._style();
        this._connect();
        setInterval(dojo.hitch(this, '_blink'), 500);
        
        //Set up clipboard
        ZeroClipboard.setMoviePath( 'zeroclipboard/ZeroClipboard.swf' );
        this.clip = new ZeroClipboard.Client();
        this.clip.setText( "Copy me!" );
        
        //Properties
        this.domNode = args.domNode;
        this.value = {start:0,end:0,string:''};
        this.displayCaret = false;
        this.currLine = 0;
        this.currLineIndex = 0;
        this.lastIndex = 0;
        this.newLine = '^';
        this.newSpace = ' ';
        this.cancelKeys = {
            9  : 'tab',
            27 : 'esc',
            91 : 'meta',
            18 : 'option',
            17 : 'control',
            16 : 'shift'
        };
        
        //Closed Properties
        this._hidden = null;    //hidden div for paste
        this._c = null;         //handle for on-the-fly connects
    };
    var proto = textarea.prototype;
    
    // Determines key-specific action
    proto.onKeyPress = function(e) {
        //console.log(e);
        var reset = false;
        if(this._meta(e) && (e.charCode==120)){             // cut
            this.cut(e);
        }else if(this._meta(e) && (e.charCode==99)){        // copy
            this.copy(e);
        }else if(e.keyCode == 37){                          // left
            reset = true;
            this.moveCaretLeft(e.shiftKey);                   
        }else if(e.keyCode == 39){                          // right
            reset = true;
            this.moveCaretRight(e.shiftKey);
        }else if(e.keyCode == 13){                          // newLine
            this.insert(this.newLine); 
        }else if(e.charCode == 32){                         // newSpace
            this.insert(this.newSpace); 
        }else if(e.keyCode == 38){                          // up
            this.moveCaretUp(e.shiftKey);
        }else if(e.keyCode == 40){                          // down
            this.moveCaretDown(e.shiftKey);
        }else if(e.keyCode == 8){                           // delete
            this.deleteChar(e);
        }else if(this.cancelKeys[e.which] != undefined){    // cancelKeys
            
        }else{                                              // otherwise, insert
            reset = true;
            this.insert(String.fromCharCode(e.which));
        }
        if(reset){
            this.getCharObj(true);
        }else{
            this.getCharObj();
        }
    };
    
    // Intercept paste / selectAll and handle with JS
    proto.listenForKeyCombo = function(e) {
        if((e.which == 224) || (e.which == 91) || (e.which == 17)){
            
            //1. Build hidden stuff and focus
            this._hidden = dojo.create('textarea',{id:'hidden',style:'position:relative;left:-10000px;'},this.div,'after');
            document.getElementById('hidden').focus();
            
            //2. Listen for v or a, paste or selectAll respectively
            if(dojo.isChrome){
                this._chromeKeyCombo();
            }else{
                this._universalKeyCombo();
            }
        }
    };
    
    // Rips through this.value and blasts proper html equiv into dom
    proto.render = function() {
        var start = (this.value.start<this.value.end) ? this.value.start : this.value.end;
        var end = (this.value.end>=this.value.start) ? this.value.end : this.value.start;
        
        // text before selection
        var s=[];
        var before='';
        var test = this.value.string.substring(0, start);
        for(var i=0; i<test.length; i++){
            if(test[i]==this.newLine){
                s.push('<br>');
            }else if(test[i]==this.newSpace){
                s.push('<span>&nbsp; </span>');
            }else{
                s.push('<span>'+test[i]+'</span>');
            }
        }
        before = s.join("");
        
        // selected text
        var u=[];
        var selection='';
        var test3 = this.value.string.substring(start, end);
        for(var m=0; m<test3.length; m++){
            if(test3[m]==this.newLine){
                u.push('<br>');
            }else if(test3[m]==this.newSpace){
                u.push('<span style="background-color:yellow;">&nbsp; </span>');
            }else{
                u.push('<span style="background-color:yellow;">'+test3[m]+'</span>');
            }
        }
        selection = u.join("");
        
        // text after selection
        var t=[];
        var after='';
        var test2 = this.value.string.substring(end, this.value.string.length);
        for(var k=0; k<test2.length; k++){
            if(test2[k]==this.newLine){
                t.push('<br>');
            }else if(test2[k]==this.newSpace){
                t.push('<span>&nbsp; </span>');
            }else{
                t.push('<span>'+test2[k]+'</span>');
            }
        }
        after = t.join("");
        
        this.before.innerHTML = before;
        this.selection.innerHTML = selection;
        this.after.innerHTML = after;
        
        if(selection.length > 0){
            this.displayCaret = false;
        }else{
            this.displayCaret = true;
        }
    };
    
    // Maps current text to this.rows
    proto.getCharObj = function(set){
        this.rows = {};
        var currY = this._findPos(this.before).top;
        var row = 1;
        var count = 0;
        var a = dojo.create('div',{innerHTML:'G'},this.before,'first');
        var lineHeight = a.clientHeight;
        dojo.destroy(a);
        var ignore = ['before', 'after', 'selection'];
        
        dojo.query("#thisDiv span").forEach(dojo.hitch(this, function(node, index, arr){
            if(dojo.indexOf(ignore,node.id) == -1){
                var pos = this._findPos(node);
                if(pos.top == currY){
                    count++;
                    this.rows[row] = count;
                }else{
                    var breaks = Math.floor((pos.top - currY)/lineHeight)-1;
                    for(var i=0; i<breaks; i++){
                        row++;
                        this.rows[row] = 0;
                    }
                    currY = pos.top;
                    count=1;
                    row++;
                    this.rows[row] = count;
                }               
            }
        }));
        if(this.rows[1] == undefined)
            this.rows[1] = 0;
        
        this.currLineIndex = this._findIndex();
        if(this.currLineIndex == undefined)
            this.currLineIndex = 0;
        this.currLine = this._findLine();
        
        console.log('index = ',this.currLineIndex);
        console.log('line = ',this.currLine);
        
        if(set && set==true)
            this.lastIndex = this.currLineIndex;
        
    };
    
    // Insert single char OR string at this.value.start
    proto.insert = function(c) {
        var start = (this.value.start<this.value.end) ? this.value.start : this.value.end;
        var end = (this.value.end>=this.value.start) ? this.value.end : this.value.start;
        var v = this.value;
        
        if(start != end){
            this.value.string = v.string.substring(0,start)+v.string.substring(end,v.string.length);
            this.clearSelection();
        }
        
        this.value.string = v.string.substring(0,start)+c+v.string.substring(start+(c.length-1),v.string.length);
        this.value.start = this.value.start+c.length;
        this.value.end = this.value.end+c.length;
        this.render();
    };
    
    // Remove single char at this.value.start
    proto.deleteChar = function() {
        var start = (this.value.start<this.value.end) ? this.value.start : this.value.end;
        var end = (this.value.end>=this.value.start) ? this.value.end : this.value.start;
        var v = this.value;
        
        if(start != end){
            this.value.string = v.string.substring(0,start)+v.string.substring(end,v.string.length);
            this.clearSelection();
        }else{
            var beforeLength = this.value.string.length+0;
            this.value.string = v.string.substring(0,v.start-1)+v.string.substring(v.start,v.string.length);
            var afterLength = this.value.string.length+0;
            if(beforeLength != afterLength){
                this.value.start--;
                this.value.end--;
            }
        }
        this.render();
    };

    // Clears current selection
    proto.clearSelection = function() {
        if(this.value.end < this.value.start){
            this.value.start = this.value.end
        }else{
            this.value.end = this.value.start;
        }
        
        this.shiftLock = false;
    };
    
    // Select all text
    proto.selectAll = function() {
        this.value.end=0; 
        this.value.start=this.value.string.length;
        this.render();
    };
    
    // Get string representation of curr value
    proto.getValue = function() {
        return this.value.string;
    };
    
    proto.moveCaretUp = function(select) {
        var amt = 0;
        //1. Get to the beginning of the line
        amt = amt + this.currLineIndex;

        
        //2. Go to next line if it exists
        if(this.rows[this.currLine-1] != undefined)
            amt = amt + 1;
        
        
        //3. Go to the lastIndex if we can
        if(this.rows[this.currLine-1] != undefined){
            if(this.rows[this.currLine-1] >= this.lastIndex){
                amt = amt + (this.rows[this.currLine-1] - this.lastIndex);
            }else{
                
            }
        }
        

        this.value.start = this.value.start - amt;
        if(!select)
            this.value.end = this.value.end - amt;
        this.render();
    };
    
    proto.moveCaretDown = function(select) {
        var amt = 0;
        //1. Get to the end of the line
        amt = amt + (this.rows[this.currLine]-this.currLineIndex);

        //2. Go to next line if it exists
        if(this.rows[this.currLine+1] != undefined)
            amt = amt + 1;
        
        //3. Go to the lastIndex if we can
        if(this.rows[this.currLine+1] != undefined){
            if(this.rows[this.currLine+1] >= this.lastIndex){
                amt = amt + this.lastIndex;
            }else{
                amt = amt + this.rows[this.currLine+1];
            }
        }
        

        this.value.start = this.value.start + amt;
        if(!select)
            this.value.end = this.value.end + amt;
        this.render();    
    };
    
    proto.moveCaretLeft = function(select) {
        if(this.value.start>0){
            this.value.start--;
            if(!select){
                this.value.end--;
                this.clearSelection();
            }
        }
        this.render();
    };
    
    proto.moveCaretRight = function(select) {  
        if(this.value.start<this.value.string.length){
            this.value.start++;
            if(!select){
                this.value.end++;
                this.clearSelection();
            }
        }
        this.render();
    };
    
    proto.moveCaretToPos = function(pos) {
        if(pos < 0){
            this.value.start = 0;
            this.value.end = 0;
        }else if(pos > this.value.string.length){
            this.value.start = this.value.string.length;
            this.value.end = this.value.string.length;
        }else if(pos <= this.value.string.length){
            this.value.start = pos;
            this.value.end = pos;
        }
        this.render();
        this.getCharObj();
    };
    
    proto._findIndex = function(){
        var start = this.value.start;
        var index = 0;
        for(var i=1; i<=this._count(this.rows); i++){
            if(start == this.rows[i]){
                return start;
            }else if(start < this.rows[i]){
                return start;
            }else if(start > this.rows[i]){
                start = start-this.rows[i]-1;
            }
        }
    };
    
    proto._findLine = function(){
        var currY = this._findPos(this.before).top;
        var top = this._findPos(this.after).top;
        var a = dojo.create('div',{innerHTML:'G'},this.before,'first');
        var lineHeight = a.clientHeight;
        dojo.destroy(a);
        return Math.floor(((top-currY)/lineHeight)+1);
        
    };
    
    proto._chromeKeyCombo = function() {
        this._c = dojo.connect(this._hidden, 'onkeydown', this,function(e){
            //Paste
            if(e.which == 86){
                this.t = setTimeout(dojo.hitch(this, function(){
                    var text = this._hidden.value;
                    this.insert(text);
                    dojo.disconnect(this._c);
                    dojo.destroy(this._hidden);
                    this.div.focus();
                    this.getCharObj(true);
                }), 100);
            //selectAll
            }else if(e.which == 65){
                this.selectAll();
                dojo.disconnect(this._c);
                dojo.destroy(this._hidden);
                this.div.focus();
            //Copy
            }else if(e.which == 67){
                console.log('copy');
                dojo.disconnect(this._c);
                dojo.destroy(this._hidden);
                this.div.focus();
            //Cut
            }else if(e.which == 88){
                console.log('cut');
                dojo.disconnect(this._c);
                dojo.destroy(this._hidden);
                this.div.focus();
            }
        });  
    };
    
    proto._universalKeyCombo = function() {
        this._c = dojo.connect(this._hidden, 'onkeypress', this,function(e){
            //Paste
            if(e.which == 118){
                this.t = setTimeout(dojo.hitch(this, function(){
                    var text = this._hidden.value;
                    this.insert(text);
                    dojo.disconnect(this._c);
                    dojo.destroy(this._hidden);
                    this.div.focus();
                    this.getCharObj(true);
                }), 100);
            //selectAll
            }else if(e.which == 97){
                this.selectAll();
                dojo.disconnect(this._c);
                dojo.destroy(this._hidden);
                this.div.focus();
            //Copy
            }else if(e.which == 99){
                console.log('copy');
                dojo.disconnect(this._c);
                dojo.destroy(this._hidden);
                this.div.focus();
            //Cut
            }else if(e.which == 120){
                console.log('cut');
                dojo.disconnect(this._c);
                dojo.destroy(this._hidden);
                this.div.focus();
            }
        });
    };
    
    proto._isPiP = function(points, pt){
        var y = 0;
        var x = 0;
        if(pt.y <= points.bottom && pt.y >= points.top)
            y = 1;
        if(pt.x <= points.right && pt.x >= points.left)
            x = 1;
        if(x==1 && y==1){
            return true;
        }else{
            return false;
        }
            
    };
    
    proto._style = function(){
        dojo.style(this.div, 'width', '100%');
        dojo.style(this.div, 'height', '100%');
        dojo.style(this.div, 'background', 'white');
        dojo.style(this.div, 'cursor', 'text');
        this._loadTemplate('../lib/cowebx/dojo/RichTextEditor/textarea.css');
    };
    
    proto._loadTemplate = function(url) {
       var e = document.createElement("link");
       e.href = url;
       e.type = "text/css";
       e.rel = "stylesheet";
       e.media = "screen";
       document.getElementsByTagName("head")[0].appendChild(e);
    };
    
    proto._connect = function(){
        dojo.connect(window, 'resize', this, 'getCharObj');
        dojo.connect(this.div, 'onclick', this, '_onClick');
        dojo.connect(this.div, 'onfocus', this, '_onFocus');
        dojo.connect(this.div, 'onblur', this, '_onBlur');
        dojo.connect(this.div, 'onkeypress', this, 'onKeyPress');
        dojo.connect(this.div, 'onkeydown', this, 'listenForKeyCombo');
        document.onkeydown = this._overrideKeys;
    };
    
    proto._onClick = function(e){
        //Clear selection
        this.clearSelection();
        this.render();
        
        var ignore = ['selection', 'before', 'after'];
        var i = 0;
        //Query the text, look for char closest to x and y of click, move caret to that pos
        dojo.query("#thisDiv span").forEach(dojo.hitch(this, function(node, index, arr){
            if(dojo.indexOf(ignore,node.id) == -1){
                i++;
                var pos = this._findPos(node);
                var width = node.offsetWidth;
                var height = node.offsetHeight;
                var points = {top: pos.top, bottom: pos.top+height, left: pos.left, right: pos.left+width};
                if(this._isPiP(points, {x:e.clientX,y:e.clientY}) == true)
                    this.moveCaretToPos(i);
            }
        }));
    };
    
    proto._onFocus = function(e){
        this.displayCaret = true;
        if(dojo.byId('hidden'))
            dojo.destroy('hidden');
    };
    
    proto._onBlur = function(){
        this.displayCaret = false;
    };
    
    proto._blink = function(){
        if(this.displayCaret){
            if(dojo.attr(this.after, 'style') == 'border-left: 1px solid white'){
                dojo.attr(this.after, 'style', '');
            }else{
                dojo.attr(this.after, 'style', 'border-left: 1px solid white');
            }
        }else{
            dojo.attr(this.after, 'style', 'border-left: 1px solid white');
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
    };
    
    proto._findPos = function(obj) {
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
    
    proto._meta = function(event){
        if(event.ctrlKey == true || event.metaKey == true)
            return true;
        return false;
    };
    
    proto._count = function(obj){
        var count = 0;
        for(var i in obj){
            count++;
        }
        return count;
    };

    return textarea;
});