define([], function() {
    var textarea = function(args){
        //Check for req'd properties
        if(!args.domNode)
            throw new Error("textarea.js: missing domNode param");

        //Build divs & spans (caret)
        this.div = dojo.create('div', {tabindex:0,id:'thisDiv'}, args.domNode);
        this.before = dojo.create('span',{id:'before'},this.div,'first');
        this.selection = dojo.create('span',{id:'selection'},this.div,'last');
        this.after = dojo.create('span',{id:'after'},this.div,'last');
        this._hiddenDiv = dojo.create('div',{style:'position:relative;left:-10000px;',contentEditable:true},this.div,'after');
        
        //Save space
        this._style();
        this._connect();
        setInterval(dojo.hitch(this, '_blink'), 500);
        
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
    };
    var proto = textarea.prototype;
    
    // Determines key-specific action
    proto.onKeyPress = function(e) {
        //console.log('e = ',e);
        if(this._meta(e) && (e.charCode==120)){             // cut
            this.cut(e);
        }else if(this._meta(e) && (e.charCode==99)){        // copy
            this.copy(e);
        }else if(this._meta(e) && (e.charCode==118)){       // paste
            this.paste(e);
        }else if(e.keyCode == 37){                          // left
            this.moveCaretLeft(e.shiftKey);                   
        }else if(e.keyCode == 39){                          // right
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
        }else if(this._meta(e) && e.charCode == 97){        // selectAll
            this.selectAll();
        }else if(this.cancelKeys[e.which] != undefined){    // cancelKeys
            
        }else{                                              // otherwise, insert
            this.insert(String.fromCharCode(e.which));  
        }

        this.getCharObj();
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
                s.push('<span><br> </span>');
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
                u.push('<span style="background-color:yellow;"><br> </span>');
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
                t.push('<span><br> </span>');
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
    };
    
    // Maps current text to this.rows
    proto.getCharObj = function(){
        this.rows = {};
        var currY = 0;
        var row = 0;
        var count = 0;
        var lineHeight = parseFloat(window.getComputedStyle(this.before).lineHeight.replace('px',''));
        
        dojo.query("#thisDiv span").forEach(dojo.hitch(this, function(node, index, arr){
            var pos = this._findPos(node);

            if(pos.top > currY){
                currY = pos.top;
                row++;
                count=0;
            }else{
                count++;
            }
            this.rows[row] = count;
            if(node.id == 'selection'){
                this.currLine = row;
                this.currLineIndex = count;
            }
        }));
        // offsets
        this.rows[this.currLine] = this.rows[this.currLine] - 2;
        this.rows[1] = this.rows[1] - 1;
        // caret movement hackiness
        if(this.rows[this.currLine] != 0)
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
    
    // Intercept paste and handle with JS
    proto.paste = function(e) {
        console.log('paste');
        this._hiddenDiv.innerHTML = '';
        this._hiddenDiv.focus();
        setTimeout(dojo.hitch(this, '_pasteCallback'), 100);
    };
    
    // Intercept cut and handle with JS
    proto.cut = function(e) {
        console.log('cut');
        if(this.value.start == this.value.end)
            return;  
    };
    
    // Intercept copy and handle with JS
    proto.copy = function(e) {
         console.log('copy');
        if(this.value.start == this.value.end)
            return;
    };
    
    proto.moveCaretUp = function(select) {
        if(this.rows[this.currLine-1] >= this.lastIndex){
           var amt = (this.value.start-this.currLineIndex-(this.rows[this.currLine-1]-this.lastIndex))-1;
        }else if(this.rows[this.currLine-1] < this.lastIndex){
           var amt = this.value.start-this.currLineIndex-1;
        }else if(this.rows[this.currLine-1] == undefined){
           var amt = this.value.start-this.currLineIndex+1;
        }
        if(amt < 0){
           this.value.start = 0;
           if(!select)
               this.value.end = 0;
        }else if(amt > this.value.string.length){
           this.value.start = this.value.string.length;
           if(!select)
               this.value.end = this.value.string.length;
        }else if(amt <= this.value.string.length){
           this.value.start = amt;
           if(!select)
               this.value.end = amt;
        }
        if(!select)
           this.clearSelection();

        this.render();
    };
    
    proto.moveCaretDown = function(select) {
        if(this.rows[this.currLine+1] >= this.lastIndex){
            var amt = (this.value.start+(this.rows[this.currLine]-this.currLineIndex)+this.lastIndex);
        }else if(this.rows[this.currLine+1] < this.lastIndex){
            var amt = this.value.start+(this.rows[this.currLine]-this.currLineIndex)+this.rows[this.currLine+1]+1;
            if(this.rows[this.currLine+2] == undefined)
                amt = amt + 1;
        }else if(this.rows[this.currLine+1] == undefined){
            var amt = this.value.start+(this.rows[this.currLine]-this.currLineIndex)+1;
        }
        if(this.currLine == 1)
            amt = amt + 1;
        if(amt < 0){
            this.value.start = 0;
            if(!select)
                this.value.end = 0;
        }else if(amt > this.value.string.length){
            this.value.start = this.value.string.length;
            if(!select)
                this.value.end = this.value.string.length;
        }else if(amt <= this.value.string.length){
            this.value.start = amt;
            if(!select)
                this.value.end = amt;
        }
        if(!select)
            this.clearSelection();
    
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
        dojo.style(this.selection, 'border-right', '1px solid black');
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
    
    proto._pasteCallback = function() {
        var pasteText = this._stripTags(this._hiddenDiv.innerHTML).replace(/&nbsp;/g,'');
        this.insert(pasteText);
        this.div.focus();
    };
    
    proto._connect = function(){
        dojo.connect(window, 'resize', this, 'getCharObj');
        dojo.connect(this.div, 'onclick', this, '_onClick');
        dojo.connect(this.div, 'onfocus', this, '_onFocus');
        dojo.connect(this.div, 'onblur', this, '_onBlur');
        dojo.connect(this.div, 'onkeypress', this, 'onKeyPress');
        document.onkeydown = this._overrideKeys;
    };
    
    proto._onClick = function(e){
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
    };
    
    proto._onBlur = function(){
        this.displayCaret = false;
    };
    
    proto._blink = function(){
        if(this.displayCaret){
            if(dojo.attr(this.selection, 'style') == 'border-right: 1px solid white'){
                dojo.attr(this.selection, 'style', '');
            }else{
                dojo.attr(this.selection, 'style', 'border-right: 1px solid white');
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

    return textarea;
});