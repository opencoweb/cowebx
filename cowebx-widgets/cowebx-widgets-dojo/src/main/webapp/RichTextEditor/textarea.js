define([
    'coweb/main',
    'dijit/Toolbar',
    'dijit/form/ToggleButton',
    'dijit/ToolbarSeparator'
], function(coweb, Toolbar, ToggleButton, Separator) {
    var textarea = function(args){
        //Check for req'd properties
        if(!args.domNode || !args.id)
            throw new Error("textarea.js: missing domNode param");
        this.domNode = args.domNode;
        this.id = args.id;

        //Build divs & spans (caret)
        this.div = dojo.create('div', {tabindex:-1,id:'thisDiv','class':'div'}, this.domNode);
        this.before = dojo.create('span',{id:'before'},this.div,'first');
        this.selection = dojo.create('span',{id:'selection'},this.div,'last');
        this.after = dojo.create('span',{id:'after'},this.div,'last');
        this._buildToolbar();
        this._buildFooter();
        
        //Save space
        this._style();
        this._connect();
        this._connectSyncs();
        this._resize(true);
        setInterval(dojo.hitch(this, '_blink'), 500);
        
        //Properties
        this.domNode = args.domNode;
        this.value = {
            start:0,
            end:0,
            string:[]
        };
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
        this.filters = [];
        
        //styles
        this.bold = false;
        this.italic = false;
        this.underline = false;
        
        //Closed Properties
        this._hidden = null;    //hidden div for paste
        this._c = null;         //handle for on-the-fly connects
        this._hold = false;
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
            //Don't allow spaces at end of lines
            if(this.before.childNodes[this.before.childNodes.length-1].innerHTML == '&nbsp; ')
                this.delete(1)
            this.insert(this.newLine); 
        }else if(e.charCode == 32){                         // newSpace
            this.insert(this.newSpace); 
        }else if(e.keyCode == 38){                          // up
            this.moveCaretUp(e.shiftKey);
        }else if(e.keyCode == 40){                          // down
            this.moveCaretDown(e.shiftKey);
        }else if(e.keyCode == 8){                           // delete
            this.delete(1);
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
            var sel = this._stripTags(this.selection.innerHTML);
            //1. Build hidden stuff and focus
            this._hidden = dojo.create('textarea',{
                id:'hidden',
                style:'position:absolute;left:-10000px;top:0px;',
                innerHTML: sel
            },this.div,'after');
            document.getElementById('hidden').focus();
            document.getElementById('hidden').select();
            
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
        var test = this.value.string.slice(0, start);
        for(var i=0; i<test.length; i++){
            var filter = test[i]['filters'];
            filter = filter.join("");
            if(test[i]['char']==this.newLine){
                s.push('<br>');
            }else if(test[i]['char']==this.newSpace){
                s.push('<span style='+filter+'>&nbsp; </span>');
            }else{
                s.push('<span style='+filter+'>'+test[i]['char']+'</span>');
            }
        }
        before = s.join("");
        
        // selected text
        var u=[];
        var selection='';
        var test3 = this.value.string.slice(start, end);
        for(var m=0; m<test3.length; m++){
            var filter = test3[m]['filters'];
            filter = filter.join("");
            if(test3[m]['char']==this.newLine){
                u.push('<br>');
            }else if(test3[m]['char']==this.newSpace){
                u.push('<span style="background-color:yellow;'+filter+'">&nbsp; </span>');
            }else{
                u.push('<span style="background-color:yellow;'+filter+'">'+test3[m]['char']+'</span>');
            }
        }
        selection = u.join("");
        
        // text after selection
        var t=[];
        var after='';
        var test2 = this.value.string.slice(end, this.value.string.length);
        for(var k=0; k<test2.length; k++){
            var filter = test2[k]['filters'];
            filter = filter.join("");
            if(test2[k]['char']==this.newLine){
                t.push('<br>');
            }else if(test2[k]['char']==this.newSpace){
                t.push('<span style='+filter+'>&nbsp; </span>');
            }else{
                t.push('<span style='+filter+'>'+test2[k]['char']+'</span>');
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
        var prev = null;
        dojo.query("#thisDiv span").forEach(dojo.hitch(this, function(node, index, arr){
            if(dojo.indexOf(ignore,node.id) == -1){
                var pos = this._findPos(node);
                if(pos.top == currY){
                    count++;
                    this.rows[row] = count;
                }else{
                    if(prev != null && prev.innerHTML == '&nbsp; '){
                        dojo.create('br',{},prev,'after');
                        dojo.destroy(prev);
                        this.rows[row] = this.rows[row]-1;
                    }
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
                prev = node;               
            }
        }));
        if(this.rows[1] == undefined)
            this.rows[1] = 0;
        
        this.currLineIndex = this._findIndex();
        if(this.currLineIndex == undefined)
            this.currLineIndex = 0;
        this.currLine = this._findLine();
        
        if(set && set==true)
            this.lastIndex = this.currLineIndex;
        
        dojo.attr('line','innerHTML',this.currLine);
        dojo.attr('col','innerHTML',this.currLineIndex);
        this._hold = false;
    };
    
    // Insert single char at this.value.start
    proto.insert = function(c) {
        var start = (this.value.start<this.value.end) ? this.value.start : this.value.end;
        var end = (this.value.end>=this.value.start) ? this.value.end : this.value.start;
        var v = this.value;
        
        if(start != end){
            this.value.string = v.string.slice(0,start).concat(v.string.slice(end,v.string.length));
            this.clearSelection();
        }
        var f = this.filters.slice();
        for(var i=0; i<c.length; i++){
            this.value.string = v.string.slice(0,start).concat([{'char':c[i],'filters':f}]).concat(v.string.slice(start,v.string.length));
            this.value.start = this.value.start+1;
            this.value.end = this.value.start;
        }
        this.render();
    };
    
    // Remove n chars at this.value.start
    proto.delete = function(n) {
        var start = (this.value.start<this.value.end) ? this.value.start : this.value.end;
        var end = (this.value.end>=this.value.start) ? this.value.end : this.value.start;
        var v = this.value;
        if(!n)
            var n = 1;
        
        if(start != end){
            this.value.string = v.string.slice(0,start).concat(v.string.slice(end,v.string.length));
            this.clearSelection();
        }else{
            var beforeLength = this.value.string.length+0;
            this.value.string = v.string.slice(0,v.start-n).concat(v.string.slice(v.start,v.string.length));
            var afterLength = this.value.string.length+0;
            if(beforeLength != afterLength){
                this.value.start = this.value.start - n;
                this.value.end = this.value.start;
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
    };
    
    // Select all text
    proto.selectAll = function() {
        this.value.end=0; 
        this.value.start=this.value.string.length;
        this.render();
    };
    
    // Get string representation of curr value
    proto.getValue = function() {
        var s = '';
        for(var i=0; i<this.value.string.length; i++){
            s = s+this.value.string[i]['char'];
        }
        return s;
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
            this.value.end = this.value.start;
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
            this.value.end = this.value.start;
        this.render();    
    };
    
    proto.moveCaretLeft = function(select) {
        var start = (this.value.start<this.value.end) ? this.value.start : this.value.end;
        var end = (this.value.end>this.value.start) ? this.value.end : this.value.start;
        
        if(!select){
            if(start>0)
                start--;
            end = start;
        }else{
            if(start>0)
                start--;
        }
        
        this.value.start = start;
        this.value.end = end;
        this.render();
    };
    
    proto.moveCaretRight = function(select) {
        var start = (this.value.start<this.value.end) ? this.value.start : this.value.end;
        var end = (this.value.end>this.value.start) ? this.value.end : this.value.start;
        
        if(!select){
            if(end<this.value.string.length)
                end++;
            start = end;
        }else{
            if(end<this.value.string.length)
                end++;
        }
        
        this.value.start = start;
        this.value.end = end;
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
                    for(var i=0; i<text.length; i++){
                        this.insert(text[i]);
                    }
                }), 100);
            //selectAll
            }else if(e.which == 65){
                this.selectAll();
            //Copy
            }else if(e.which == 99){
                this._pause(100);
            //Cut
            }else if(e.which == 88){
                this._pause(100);
                var end = (this.value.end>=this.value.start) ? this.value.end : this.value.start;
                var len = this._stripSpaces(this._stripTags(this.selection.innerHTML)).length;
                this.value.start = end;
                this.delete(len);
            }
            
            setTimeout(dojo.hitch(this, function(){
                dojo.disconnect(this._c);
                dojo.destroy(this._hidden);
                this.div.focus();
                this.getCharObj(true);
            }), 300);
        });  
    };
    
    proto._universalKeyCombo = function() {
        this._c = dojo.connect(this._hidden, 'onkeypress', this,function(e){
            //Paste
            if(e.which == 118){
                this.t = setTimeout(dojo.hitch(this, function(){
                    var text = this._hidden.value;
                    this.insert(text);
                }), 100);
            //selectAll
            }else if(e.which == 97){
                this.selectAll();
            //Copy
            }else if(e.which == 99){
                this._pause(100);
            //Cut
            }else if(e.which == 120){
                this._pause(100);
                var end = (this.value.end>=this.value.start) ? this.value.end : this.value.start;
                var len = this._stripSpaces(this._stripTags(this.selection.innerHTML)).length;
                this.value.start = end;
                this.delete(len);
            }
            
            setTimeout(dojo.hitch(this, function(){
                dojo.disconnect(this._c);
                dojo.destroy(this._hidden);
                this.div.focus();
                this.getCharObj(true);
            }), 300);
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
        dojo.connect(window, 'resize', this, '_resize');
        dojo.connect(this.div, 'onmousedown', this, '_onMouseDown');
        dojo.connect(this.div, 'onmouseup', this, '_onClick');
        dojo.connect(this.div, 'onfocus', this, '_onFocus');
        dojo.connect(this.div, 'onblur', this, '_onBlur');
        dojo.connect(this.div, 'onkeypress', this, 'onKeyPress');
        dojo.connect(this.div, 'onkeydown', this, 'listenForKeyCombo');
        document.onkeydown = this._overrideKeys;
    };
    
    proto._resize = function(initial) {
        if(initial != true){
            this.render();
            this.getCharObj(true);
        }
        
        dojo.style(this.div, 'height', (window.innerHeight-150)+'px');
    };

    proto._onMouseDown = function(e){
        this._selStart = {x:e.clientX,y:e.clientY};
    };
    
    proto._onClick = function(e){
        //Clear selection
        this.clearSelection();
        this.render();
        
        var _prevStart = this.value.start;
        var _prevEnd = this.value.end;
        var ignore = ['selection', 'before', 'after'];
        var i=0;j = 0;
        var start = null;
        var end = null;
        
        //Point in Polygon to find selection Start
        dojo.query("#thisDiv span, br").forEach(dojo.hitch(this, function(node, index, arr){
            if(dojo.indexOf(ignore,node.id) == -1){
                i++;
                if(node.tagName == 'SPAN'){
                    var pos = this._findPos(node);
                    var width = node.offsetWidth;
                    var height = node.offsetHeight;
                    var points = {top: pos.top, bottom: pos.top+height, left: pos.left, right: pos.left+width};
                    if(this._isPiP(points, this._selStart) == true)
                        start = i;
                }
            }
        }));
        
        //Point in Polygon to find selection End
        dojo.query("#thisDiv span, br").forEach(dojo.hitch(this, function(node, index, arr){
            if(dojo.indexOf(ignore,node.id) == -1){
                j++;
                if(node.tagName == 'SPAN'){
                    var pos = this._findPos(node);
                    var width = node.offsetWidth;
                    var height = node.offsetHeight;
                    var points = {top: pos.top, bottom: pos.top+height, left: pos.left, right: pos.left+width};
                    if(this._isPiP(points, {x:e.clientX,y:e.clientY}) == true)
                        end = j;
                }
            }
        }));
        
        if(start && end){
            this.value.start = start;
            this.value.end = end;

            if(end != start)
                this.value.start = (start>0) ? start-1 : 0;

            this.render();
            this.getCharObj(true);
        }
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
    
    proto._stripSpaces = function (string) {
        var s = string.replace(new RegExp("&nbsp;", 'g'),'');
        return s;
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
    
    proto._pause = function(millis){
        var date = new Date();
        var curDate = null;
        do { curDate = new Date(); }
        while(curDate-date < millis);
    };
    
    proto._buildToolbar = function(){
        var toolbarNode = dojo.create('div',{style:'width:100%;height:50px;'},this.div,'before');
        
        this._toolbar = new Toolbar({},toolbarNode);
        dojo.attr(this._toolbar.domNode, 'class', 'gradient header');
        dojo.forEach(["Bold", "Italic", "Underline"], dojo.hitch(this, function(label) {
            var button = new ToggleButton({
                label: label,
                showLabel: false,
                iconClass: "dijitEditorIcon dijitEditorIcon" + label
            });
            this[label] = button;
            this._toolbar.addChild(button);
            dojo.connect(button, 'onclick', this, '_on'+label+'Click');
        }));
        var sep = new Separator({});
        this._toolbar.addChild(sep);
    };
    
    proto._connectSyncs = function() {
        this.collab = coweb.initCollab({id : this.id});
        this.collab.subscribeSync('editorBold', this, '_onRemoteStyle');
        this.collab.subscribeSync('editorItalic', this, '_onRemoteStyle');
        this.collab.subscribeSync('editorUnderline', this, '_onRemoteStyle');
    };
    
    proto._onRemoteStyle = function(obj) {
        this.value.string = obj.value.string
        this.render();
    };
    
    proto._onBoldClick = function() {
        if(this._lastOp != 'bold')
            this._hold = false;
        var start = (this.value.start<this.value.end) ? this.value.start : this.value.end;
        var end = (this.value.end>=this.value.start) ? this.value.end : this.value.start;
        if(start == end){
            if(this.bold == false){
                this.bold = true;
                this.filters.push('font-weight:bold;');
                dojo.attr(this.Bold.domNode.childNodes[0], 'style', 'background-color:red');
            }else{
                this.bold = false;
                this.filters[dojo.indexOf(this.filters,'font-weight:bold;')] = '';
                dojo.attr(this.Bold.domNode.childNodes[0], 'style', '');
            }
        }else{
            if(this._hold == false){
                for(var i=start; i<end; i++){
                    if(this.value.string[i]['filters'] == undefined){
                        this.value.string[i]['filters'] = [];
                    }
                    if(dojo.indexOf(this.value.string[i]['filters'],'font-weight:bold;') == -1){
                        this.value.string[i]['filters'].push('font-weight:bold;'); 
                    }        
                }
                this.render();
                this._hold = true;
                this.collab.sendSync('editorBold', {'string':this.value.string}, null);   
            }else if(this._hold == true && this._lastOp == 'bold'){
                for(var i=start; i<end; i++){
                    if(this.value.string[i]['filters'] == undefined){
                        this.value.string[i]['filters'] = [];
                    }
                    if(dojo.indexOf(this.value.string[i]['filters'],'font-weight:bold;') == -1){
                        this.value.string[i]['filters'].push('font-weight:bold;'); 
                    }else{
                        this.value.string[i]['filters'][dojo.indexOf(this.value.string[i]['filters'],'font-weight:bold;')] = '';
                    }
                }
                this.render();
                this._hold = true;
                this.collab.sendSync('editorBold', {'string':this.value.string}, null);
            }
        }
        this._lastOp = 'bold';
        this.div.focus();
    };
    
    proto._onItalicClick = function() {
        if(this._lastOp != 'italic')
            this._hold = false;
        var start = (this.value.start<this.value.end) ? this.value.start : this.value.end;
        var end = (this.value.end>=this.value.start) ? this.value.end : this.value.start;
        if(start == end){
            if(this.bold == false){
                this.bold = true;
                this.filters.push('font-style:italic;');
                dojo.attr(this.Italic.domNode.childNodes[0], 'style', 'background-color:red');
            }else{
                this.bold = false;
                this.filters[dojo.indexOf(this.filters,'font-style:italic;')] = '';
                dojo.attr(this.Italic.domNode.childNodes[0], 'style', ' ');
            }
        }else{
            if(this._hold == false){
                for(var i=start; i<end; i++){
                    if(this.value.string[i]['filters'] == undefined){
                        this.value.string[i]['filters'] = [];
                    }
                    if(dojo.indexOf(this.value.string[i]['filters'],'font-style:italic;') == -1){
                        this.value.string[i]['filters'].push('font-style:italic;'); 
                    }        
                }
                this.render();
                this._hold = true;
                this.collab.sendSync('editorItalic', {'string':this.value.string}, null);
            }else if(this._hold == true && this._lastOp == 'italic'){
                for(var i=start; i<end; i++){
                    if(this.value.string[i]['filters'] == undefined){
                        this.value.string[i]['filters'] = [];
                    }
                    if(dojo.indexOf(this.value.string[i]['filters'],'font-style:italic;') == -1){
                        this.value.string[i]['filters'].push('font-style:italic;'); 
                    }else{
                        this.value.string[i]['filters'][dojo.indexOf(this.value.string[i]['filters'],'font-style:italic;')] = '';
                    }
                }
                this.render();
                this._hold = true;
                this.collab.sendSync('editorItalic', {'string':this.value.string}, null);
            }
        }
        this._lastOp = 'italic';
        this.div.focus();
    };
    
    proto._onUnderlineClick = function() {
        if(this._lastOp != 'underline')
            this._hold = false;
        var start = (this.value.start<this.value.end) ? this.value.start : this.value.end;
        var end = (this.value.end>=this.value.start) ? this.value.end : this.value.start;
        if(start == end){
            if(this.bold == false){
                this.bold = true;
                this.filters.push('text-decoration:underline;');
                dojo.attr(this.Underline.domNode.childNodes[0], 'style', 'background-color:red');
            }else{
                this.bold = false;
                this.value.string[i]['filters'][dojo.indexOf(this.value.string[i]['filters'],'text-decoration:underline;')] = '';
                dojo.attr(this.Underline.domNode.childNodes[0], 'style', '');
            }
        }else{
            if(this._hold == false){
                for(var i=start; i<end; i++){
                    if(this.value.string[i]['filters'] == undefined){
                        this.value.string[i]['filters'] = [];
                    }
                    if(dojo.indexOf(this.value.string[i]['filters'],'text-decoration:underline;') == -1){
                        this.value.string[i]['filters'].push('text-decoration:underline;'); 
                    }        
                }
                this.render();
                this._hold = true;
                this.collab.sendSync('editorUnderline', {'string':this.value.string}, null);
            }else if(this._hold == true && this._lastOp == 'underline'){
                for(var i=start; i<end; i++){
                    if(this.value.string[i]['filters'] == undefined){
                        this.value.string[i]['filters'] = [];
                    }
                    if(dojo.indexOf(this.value.string[i]['filters'],'text-decoration:underline;') == -1){
                        this.value.string[i]['filters'].push('text-decoration:underline;'); 
                    }else{
                        this.value.string[i]['filters'][dojo.indexOf(this.value.string[i]['filters'],'text-decoration:underline;')] = '';
                    }
                }
                this.render();
                this._hold = true;
                this.collab.sendSync('editorUnderline', {'string':this.value.string}, null);
            }
        }
        this._lastOp = 'underline';
        this.div.focus();
    };
    
    proto._buildFooter = function(){
        var footerNode = dojo.create('div',{'class':'footer gradient'},this.div,'after');
        var div = dojo.create('div',{'class':'footerDiv'},footerNode,'first');
        var line = dojo.create('span',{style:'float:left',innerHTML:'Line: '+'<span id="line">0</span>'},div,'last');
        var col = dojo.create('span',{style:'float:right;',innerHTML:'Col: '+'<span id="col">0</span>'},div,'last');
    };
    

    

    return textarea;
});