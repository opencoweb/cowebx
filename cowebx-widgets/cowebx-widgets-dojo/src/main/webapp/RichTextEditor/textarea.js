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
        this.caret = dojo.create('span', {id:'caret',style:'background:black;visibility:hidden;', innerHTML:'|'},'before','after');
        this.caretTimer = setInterval(dojo.hitch(this, '_blink'), 500);
        
        //Save space
        this._style();
        this._connect();
        
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
            17 : 'control'
        };
    };
    var proto = textarea.prototype;
    
    // Determines key-specific action
    proto.onKeyPress = function(e) {        

        if(!(this._meta(e) && ((e.charCode==114 || 82))))    //refresh
            e.preventDefault();
        if(e.keyCode == 37){                                // left
            this.moveCaretLeft(e.shiftKey);                   
        }else if(e.keyCode == 39){                          // right
            this.moveCaretRight(e.shiftKey);
        }else if(e.keyCode == 13){                          // newLine
            this.insertChar(this.newLine); 
        }else if(e.charCode == 32){                         // newSpace
            this.insertChar(this.newSpace); 
        }else if(e.keyCode == 38){                          // up
            this.moveCaretUp(e.shiftKey);
        }else if(e.keyCode == 40){                          // down
            this.moveCaretDown(e.shiftKey);
        }else if(e.keyCode == 8){                           // delete
            this.deleteChar(e);
        }else if(this._meta(e) && e.charCode == 97){         // selectAll
            this.selectAll();
        }else if(this.cancelKeys[e.keyCode]){               // cancelKeys

        }else{                                              // otherwise, insert
            this.insertChar(String.fromCharCode(e.which));  
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
    };
    
    // Maps current text to this.rows
    proto.getCharObj = function(){
        this.rows = {};
        var currY = 0;
        var row = 0;
        var count = 0;
        var lineHeight = parseFloat(window.getComputedStyle(this.before).lineHeight.replace('px',''));
        dojo.query("#thisDiv span, br").forEach(dojo.hitch(this, function(node, index, arr){
            var pos = this._findPos(node);
            if(pos.top > currY){
                currY = pos.top;
                row++;
                count=0;
            }else{
                count++;
            }
            this.rows[row] = count;
            if(node.id == 'caret'){
                this.currLine = row;
                this.currLineIndex = count;
            }
        }));
        // offset the first row to account for extra span
        this.rows[1] = this.rows[1]-1;
        // caret movement hackiness
        if(this.rows[this.currLine] != 3){
            this.lastIndex = this.currLineIndex;
        }
    };
    
    // Insert single char at this.value.start
    proto.insertChar = function(c) {
        var start = (this.value.start<this.value.end) ? this.value.start : this.value.end;
        var end = (this.value.end>=this.value.start) ? this.value.end : this.value.start;
        var v = this.value;
        
        if(start != end){
            this.value.string = v.string.substring(0,start)+v.string.substring(end,v.string.length);
            this.clearSelection();
        }
        
        this.value.string = v.string.substring(0,start)+c+v.string.substring(start,v.string.length);
        this.value.start++;
        this.value.end++;
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
            var amt = (this.value.start+(this.rows[this.currLine]-this.currLineIndex)+this.lastIndex)-2;
        }else if(this.rows[this.currLine+1] < this.lastIndex){
            var amt = this.value.start+(this.rows[this.currLine]-this.currLineIndex)+this.rows[this.currLine+1]-2;
            if(this.rows[this.currLine+2] == undefined)
                amt = amt + 1;
        }else if(this.rows[this.currLine+1] == undefined){
            var amt = this.value.start+(this.rows[this.currLine]-this.currLineIndex);
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
        if(select)
            dojo.place(this.caret, this.before, 'after');
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
        if(select)
            dojo.place(this.caret, this.after, 'before');
        this.render();
    };
    
    proto.moveCaretTo = function(pos) {
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
    
    proto._style = function(){
        dojo.style(this.div, 'width', '100%');
        dojo.style(this.div, 'height', '100%');
        dojo.style(this.div, 'background', 'white');
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
        dojo.connect(this.div, 'onfocus', this, '_onFocus');
        dojo.connect(this.div, 'onblur', this, '_onBlur');
        dojo.connect(this.div, 'onkeypress', this, 'onKeyPress');
        dojo.connect(this.div, 'onclick', this, function(){
            console.log(this.lastIndex);
        });
        document.onkeydown = this._overrideKeys;
    };
    
    proto._onFocus = function(){
        this.displayCaret = true;
        this._currY = this._findPos(this.caret).top;
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