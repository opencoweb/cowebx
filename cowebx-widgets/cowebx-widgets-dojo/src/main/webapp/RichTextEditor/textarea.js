define([], function() {
    var textarea = function(args){
        //Check for req'd properties
        if(!args.domNode)
            throw new Error("textarea.js: missing domNode param");

        //Build stuff
        this.div = dojo.create('div', {tabindex:0,id:'thisDiv'}, args.domNode);
        this.before = dojo.create('span',{id:'before'},this.div,'first');
        this.selection = dojo.create('span',{id:'selection'},this.div,'last');
        this.after = dojo.create('span',{id:'after'},this.div,'last');
        this.caret = dojo.create('span', {id:'caret',style:'background:black;visibility:hidden;', innerHTML:'|'},'before','after');
        this.caretTimer = setInterval(dojo.hitch(this, '_blink'), 500);
        
        //Do stuff
        this._style();
        this._connect();
        
        //Properties
        this.displayCaret = false;
        this.shiftLock = false;
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

        if(!(this.meta(e) && ((e.charCode==114 || 82))))    //refresh
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
        }else if(this.meta(e) && e.charCode == 97){         // selectAll
            console.log('all');
            this.selectAll();
        }else if(this.cancelKeys[e.keyCode]){               // cancelKeys

        }else{
            this.insertChar(String.fromCharCode(e.which));
        }
        
        this.getCharObj();
    };
    
    proto.render = function() {
        var start = (this.value.start<this.value.end) ? this.value.start : this.value.end;
        var end = (this.value.end>=this.value.start) ? this.value.end : this.value.start;
        
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
        for(var j=0; j<s.length; j++){
            before = before + s[j];
        }
        
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
        for(var n=0; n<u.length; n++){
            selection = selection + u[n];
        }
        
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
        for(var l=0; l<t.length; l++){
            after = after + t[l];
        }
        
        this.before.innerHTML = before;
        this.selection.innerHTML = selection;
        this.after.innerHTML = after;
    };
    
    proto.getCharObj = function(){
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
                count++;
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
    
    proto.moveCaretUp = function(select) {
        if(this.rows[this.currLine-1] >= this.currLineIndex){
            var amt = this.value.start-this.rows[this.currLine-1]-1;
        }else if(this.rows[this.currLine-1] < this.currLineIndex){
            var amt = this.value.start-this.currLineIndex-1;
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
        if(this.rows[this.currLine+1] >= this.currLineIndex){
            var amt = this.value.start+this.rows[this.currLine]-2;
        }else if(this.rows[this.currLine+1] < this.currLineIndex){
            var amt = this.value.start+(this.rows[this.currLine]-this.currLineIndex)+this.rows[this.currLine+1]-2;
            if(this.currLine == 1)
                amt = amt + 1;
            if(this.rows[this.currLine+2] == undefined){
                console.log(this.rows);
                amt = amt + 1;
            }
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
    
    proto.clearSelection = function() {
        if(this.value.end < this.value.start){
            this.value.start = this.value.end
        }else{
            this.value.end = this.value.start;
        }
        
        this.shiftLock = false;
    };
    
    proto.selectAll = function() {
        this.value.end=0; 
        this.value.start=this.value.string.length;
        this.render();
    };
    
    proto.getValue = function() {
        return this.value.string;
    };
    
    proto._style = function(){
        //dojo.attr(this.div, 'style', 'word-wrap:break-word;');
        dojo.style(this.div, 'width', '100%');
        dojo.style(this.div, 'height', '100%');
        dojo.style(this.div, 'background', 'white');
        this.load_template('../lib/cowebx/dojo/RichTextEditor/textarea.css');
    };
    
    proto.load_template = function(url) {
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
            console.log(this.value.start+' : '+this.value.end);
        });
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
    
    proto.meta = function(event){
        if(event.ctrlKey == true || event.metaKey == true)
            return true;
        return false;
    };

    return textarea;
});