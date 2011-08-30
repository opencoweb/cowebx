define([
    'coweb/main',
    'dijit/Toolbar',
    'dijit/form/ToggleButton',
    'dijit/ToolbarSeparator',
    'dijit/Dialog',
    'dijit/ColorPalette'
], function(coweb, Toolbar, ToggleButton, Separator, Dialog, ColorPalette) {
    var textarea = function(args){
        if(!args.domNode || !args.id)
            throw new Error("Textarea: missing arg");
            
        //1. Process args
        this.noSlider       =   (!args.noSlider) ? false : args.noSlider;
        this.domNode        =   args.domNode;
        this.id             =   args.id;

        //2. Build stuff
        this.container      =   dojo.create('div',{'style':'height:100%;min-width:800px;overflow:hidden;'},this.domNode);
        this.div            =   this._buildTable();
        this.frame          =   dojo.create('div',{id:'thisFrame'},this.div,'first');
        this.toolbar        =   this._buildToolbar();
        this.footer         =   this._buildFooter();
        this.selection      =   dojo.create('span',{id:'selection',style:'border-left:1px solid black;'},this.frame,'last');
        this.dialog         =   this._buildConfirmDialog();
        
        //3. Style and connect
        this._style();
        this._connect();
        this._connectSyncs();
        this._resize(true);
        setInterval(dojo.hitch(this, '_blink'), 300);
        
        // properties
        this.history        =   [];
        this.value          =   {start:0,end:0,string:[]};
        this.currLine       =   0;
        this.currLineIndex  =   0;
        this.displayCaret   =   false;
        this.sliderShowing  =   false;
        this.lastIndex      =   0;
        this.title          =   'Untitled Document';
        this.newLine        =   '^';
        this.newSpace       =   ' ';
        this.filters        =   [];
        this.cancelKeys     =   {
            27 : 'esc',
            91 : 'meta',
            18 : 'option',
            17 : 'control',
            16 : 'shift'
        };
        // styles
        this._bold              =   false;
        this._italic            =   false;
        this._underline         =   false;
        this._strikethrough     =   false;
        this._forecolor         =   false;
        this._hilitecolor       =   false;
        this._pastForeColors    =   [];
        this._pastHiliteColors  =   [];
        this._lock              =   false;
        this._paste             =   false;
        this._caret             =   true;
    };
    var proto = textarea.prototype;
    
    // Determines key-specific action
    proto.onKeyPress = function(e) {
        var reset = false;
        if(e.keyCode == 37){                                // left
            reset = true;
            this.moveCaretLeft(e.shiftKey);                   
        }else if(e.keyCode == 39){                          // right
            reset = true;
            this.moveCaretRight(e.shiftKey);
        }else if(e.keyCode == 13){                          // newLine
            if(this.value.string[this.value.start-1] && this.value.string[this.value.start-1]['char'] == ' ')
                this._delete(1);
            setTimeout(dojo.hitch(this, function(){this.insert(this.newLine);}), 100);
        }else if(e.keyCode == 9){                           // tab
            reset = true;
            this.insert('    ');
        }else if(e.charCode == 32){                         // newSpace
            reset = true;     
            this.insert(this.newSpace); 
        }else if(e.keyCode == 38){                          // up
            this.moveCaretUp(e.shiftKey);
        }else if(e.keyCode == 40){                          // down
            this.moveCaretDown(e.shiftKey);
        }else if(e.keyCode == 8){                           // delete
            this._delete(1);
        }else if(this.cancelKeys[e.which] != undefined){    // cancelKeys
        }else{
            reset = true;                                   // otherwise, insert
            this.insert(String.fromCharCode(e.which));
        }
        e.preventDefault();
    };

    // Rips through all of this.value and blasts proper html equiv into dom
    proto.render = function(slider) {
        console.log('full render');
        var start = (this.value.start<this.value.end) ? this.value.start : this.value.end;
        var end = (this.value.end>=this.value.start) ? this.value.end : this.value.start;
        var a = [];
        var b = [];
        var c = [];
        var sel = 'background-color:#99CCFF;';

        for(var i=0, len=this.value.string.length; i<len; i++){
           var p = this.value.string[i];
           var filter = p['filters'].join('');
           if(p['char']==this.newLine){
               if(i<start){
                   a.push('<br>');
               }else if(i>end){
                   c.push('<br>');
               }else{
                   b.push('<br>');
               }
           }else if(p['char']==this.newSpace){
               if(i<start){
                   a.push('<span style='+filter+'>&nbsp; </span>');
               }else if(i>=end){
                   c.push('<span style='+filter+'>&nbsp; </span>');
               }else{
                   b.push('<span style='+filter+sel+'>&nbsp; </span>')
               }
           }else{
               if(i<start){
                   a.push('<span style='+filter+'>'+p['char']+'</span>');
               }else if(i>=end){
                   c.push('<span style='+filter+'>'+p['char']+'</span>');
               }else{
                   b.push('<span style='+filter+sel+'>'+p['char']+'</span>');
               }
           }
        }
        var tempA = a.join("");
        var tempB = b.join("");
        var tempC = c.join("");

        this.frame.innerHTML = tempA;
        this.selection = dojo.create('span',{id:'selection',innerHTML:tempB,style:'border-left:1px solid black;'},this.frame,'last');
        this.frame.innerHTML = this.frame.innerHTML + tempC;

        //Get char object
        this._renderLineNumbers();

        if(!slider || slider==false)
           dojo.publish("editorHistory", [{save:dojo.clone(this.value)}]);
    };
    
    // Maps current text to this.rows
    proto.getCharObj = function(set){

    };
    
    // Insert single char at this.value.start & custom render
    proto.insert = function(c, paste) {
        var start = (this.value.start<this.value.end) ? this.value.start : this.value.end;
        var end = (this.value.end>=this.value.start) ? this.value.end : this.value.start;
        var v = this.value;
        if(paste)
            this._paste = true;
        
        //1. clear selection if there is one
        if(start != end)
            this.destroySelection();
        
        //2. change string in memory
        for(var i=c.length-1; i>=0; i--){
            var f = this.filters.slice();
            if(!paste || paste==undefined){
                v.string = v.string.slice(0,start).concat([{'char':c[i],'filters':f}]).concat(v.string.slice(start,v.string.length));
            }else{
                v.string = v.string.slice(0,start).concat([{'char':c[i],'filters':[]}]).concat(v.string.slice(start,v.string.length));
            }
            v.start = v.start+1;
            v.end = v.start;
        }
        
        //3. custom partial render of dom
        for(var i=0; i<c.length; i++){
            var filters = v.string[v.start-i-1]['filters'].join("");
            if(c[i] == this.newSpace){
                var node = dojo.create('span',{innerHTML:'&nbsp; ', 'style':filters},dojo.byId('selection'),'before');
            }else if(c[i] == this.newLine){
                dojo.create('br',{},dojo.byId('selection'),'before');
            }else{
                var node = dojo.create('span',{innerHTML:c[i],'style':filters},dojo.byId('selection'),'before');
            }
        }
        
        this._lock = false;  
    };
    
    // Remove n chars at this.value.start & custom render
    proto._delete = function(n) {
        if(this.value.string.length>0){
            var start = (this.value.start<this.value.end) ? this.value.start : this.value.end;
            var end = (this.value.end>=this.value.start) ? this.value.end : this.value.start;
            var v = this.value;
            if(!n)
                var n = 1;

            if(start != end){
                this.destroySelection();
            }else{
                var beforeLength = v.string.length+0;
                v.string = v.string.slice(0,v.start-n).concat(v.string.slice(v.start,v.string.length));
                var afterLength = v.string.length+0;
                if(beforeLength != afterLength){
                    v.start = v.start - n;
                    v.end = v.start;
                }

                if(dojo.byId('selection').previousSibling){
                    for(var i=0; i<n; i++){
                        dojo.destroy(dojo.byId('selection').previousSibling);
                    }
                }else{
                    this.frame.innerHTML = '';
                    this.selection = dojo.create('span',{id:'selection',innerHTML:'',style:'border-left:1px solid black;'},this.frame,'last');
                }
            }
            
            this._lock = false; 
        }
    };

    // Clears current selection, sends caret to DIR ('left' or 'right') & custom render
    proto.clearSelection = function(dir) {
        var v = this.value;
        var start = (this.value.start<this.value.end) ? this.value.start : this.value.end;
        var end = (this.value.end>this.value.start) ? this.value.end : this.value.start;
        
        if(!dir || dir == 'left'){
            v.start = start;
            v.end = start;
            for(var i=dojo.byId('selection').childNodes.length-1; i>=0; i--){
                var x = dojo.byId('selection').childNodes[i];
                if(dojo.attr(x, "style"))
                    dojo.attr(x,'style', dojo.attr(x,'style').replace('background-color:#99CCFF;',''));
                dojo.place(x,dojo.byId('selection'),'after');   
            }
        }else if(dir && dir == 'right'){
            v.start = end;
            v.end = end;
            for(var i=0, len=dojo.byId('selection').childNodes.length; i<len; i++){
                var x = dojo.byId('selection').childNodes[0];
                if(dojo.attr(x, "style"))
                    dojo.attr(x,'style', dojo.attr(x,'style').replace('background-color:#99CCFF;',''));
                dojo.place(x,dojo.byId('selection'),'before');
            }
        }
    };
    
    // Deletes current selection & custom render
    proto.destroySelection = function() {
        var v = this.value;
        var start = (this.value.start<this.value.end) ? this.value.start : this.value.end;
        var end = (this.value.end>this.value.start) ? this.value.end : this.value.start;
        var l = dojo.byId('selection').childNodes.length;
        this.clearSelection();
        
        for(var i=0; i<l; i++)
            dojo.destroy(dojo.byId('selection').nextSibling);
        v.string = v.string.slice(0,start).concat(v.string.slice(end,v.string.length));
    };
    
    // Select all text & full render
    proto.selectAll = function() {
        var v = this.value;
        if(!(v.end == 0 && v.start == v.string.length)){
            this.clearSelection('right');
            dojo.destroy('selection');
            var tmp = dojo.byId('thisFrame').innerHTML+'';
            dojo.byId('thisFrame').innerHTML = '';
            this.selection = dojo.create('span',{id:'selection',innerHTML:tmp,style:'border-left:1px solid black;background-color:#99CCFF;'},this.frame,'last');
            v.end=v.string.length;
            v.start=0;
        }
    };
    
    // Get plain string representation of curr value
    proto.getValue = function() {
        var s = '';
        for(var i=0; i<this.value.string.length; i++)
            s = s+this.value.string[i]['char'];
        return s;
    };
    
    // Set plain string representation of curr value
    proto.setValue = function(string) {
        var s = [];
        for(var i=0; i<string.length; i++)
            s.push({'char':string[i],'filters':[]});
        this.value.string = s;
        
        this.frame.innerHTML = '';
        this.selection = dojo.create('span',{id:'selection',innerHTML:'',style:'border-left:1px solid black;'},this.frame,'last');
        this.insert(string, true);
    };
    
    // Move caret up one line & custom render
    proto.moveCaretUp = function(select) {
        var i=0;
        var top = Math.round(dojo.byId('selection').offsetTop-this._lineHeight);
        var lineAbove = {};
        var line = {};
        if(this.value.start != this.value.end)
            this.clearSelection();
        
        dojo.query('#thisFrame span, #thisFrame br').forEach(dojo.hitch(this, function(node, index, arr){
            if(node.offsetTop > top-2 && node.offsetTop < top+2 && node.tagName != 'BR'){
                lineAbove[this._count(lineAbove)] = {
                    node: node,
                    index: i
                };
            }else if(node.offsetTop == dojo.byId('selection').offsetTop){
                line[this._count(line)] = {
                    node: node,
                    index: i
                };
            }
            i++;
        }));
        
        if(!this._lock){
            for(var k in line){
                if(line[k]['node'].id=='selection')
                    this._lineIndex = k;
            }
            this._lock = true;    
        }
        
        var count = this._count(lineAbove);
        if(this._count(lineAbove)>0){
            if(count >= this._lineIndex){
                if(lineAbove[this._lineIndex]){
                    if(select){
                       
                    }else{
                        this.value.start = lineAbove[this._lineIndex].index;
                        this.value.end = lineAbove[this._lineIndex].index;
                        dojo.place('selection', lineAbove[this._lineIndex].node, 'before');
                    }
                }else{
                    if(select){
                        
                    }else{
                        this.value.start = lineAbove[this._lineIndex-1].index+1;
                        this.value.end = lineAbove[this._lineIndex-1].index+1;
                        dojo.place('selection', lineAbove[this._lineIndex-1].node, 'after');
                    }
                }
            }else if(count < this._lineIndex){
                if(select){
                    
                }else{
                    this.value.start = lineAbove[0].index+count-1;
                    this.value.end = lineAbove[0].index+count-1;
                    dojo.place('selection', lineAbove[count-1].node, 'after');
                }
            }
        }else{
            if(line[0].node.previousSibling){
                this.value.start = line[0].index-1;
                this.value.end = line[0].index-1;
                dojo.place('selection', line[0].node.previousSibling, 'before');   
            }
        }
    };
    
    // Move caret down one line & custom render
    proto.moveCaretDown = function(select) {
        var i=0;
        var top = Math.round(dojo.byId('selection').offsetTop+this._lineHeight);
        var lineBelow = {};
        var line = {};
        if(this.value.start != this.value.end)
            this.clearSelection();
        
        dojo.query('#thisFrame span, #thisFrame br').forEach(dojo.hitch(this, function(node, index, arr){
            if(node.offsetTop > top-2 && node.offsetTop < top+2 && node.tagName != 'BR'){
                lineBelow[this._count(lineBelow)] = {
                    node: node,
                    index: i
                };
            }else if(node.offsetTop == dojo.byId('selection').offsetTop){
                line[this._count(line)] = {
                    node: node,
                    index: i
                };
            }
            i++;
        }));
        
        if(!this._lock){
            for(var k in line){
                if(line[k]['node'].id=='selection')
                    this._lineIndex = k;
            }
            this._lock = true;    
        }
        
        var count = this._count(lineBelow);
        if(this._count(lineBelow)>0){
            if(count >= this._lineIndex){
                if(lineBelow[this._lineIndex]){
                    this.value.start = (lineBelow[this._lineIndex].index-1>this.value.string.length) ? this.value.string.length : lineBelow[this._lineIndex].index-1;
                    this.value.end = (lineBelow[this._lineIndex].index-1>this.value.string.length) ? this.value.string.length : lineBelow[this._lineIndex].index-1;
                    dojo.place('selection', lineBelow[this._lineIndex].node, 'before');
                }else{
                    this.value.start = (lineBelow[this._lineIndex-1].index+1>this.value.string.length) ? this.value.string.length : lineBelow[this._lineIndex-1].index+1;
                    this.value.end = (lineBelow[this._lineIndex-1].index+1>this.value.string.length) ? this.value.string.length : lineBelow[this._lineIndex-1].index+1;
                    
                    dojo.place('selection', lineBelow[this._lineIndex-1].node, 'after');
                }
            }else if(count < this._lineIndex){
                this.value.start = (lineBelow[0].index+count-1>this.value.string.length) ? this.value.string.length : lineBelow[0].index+count-1;
                this.value.end = (lineBelow[0].index+count-1>this.value.string.length) ? this.value.string.length : lineBelow[0].index+count-1;
                dojo.place('selection', lineBelow[count-1].node, 'after');
            }
        }else{
            if(line[this._count(line)-1].node.nextSibling){
                this.value.start = line[this._count(line)-1].index+1;
                this.value.end = line[this._count(line)-1].index+1;
                dojo.place('selection', line[this._count(line)-1].node.nextSibling, 'after');   
            }
        }
    };
    
    // Move caret left one char & custom render
    proto.moveCaretLeft = function(select) {
        var start = (this.value.start<this.value.end) ? this.value.start : this.value.end;
        var end = (this.value.end>this.value.start) ? this.value.end : this.value.start;
        
        if(!select){
            if(dojo.byId('selection').childNodes.length > 0){
                this.clearSelection('left');
            }else{
                if(start>0){
                    start--;
                    end = start;
                    this.value.start = start;
                    this.value.end = end;
                    var tmp = dojo.byId('selection').previousSibling;
                    dojo.place(tmp, dojo.byId('selection'), 'after');
                }   
            }
        }else{
            if(start>0){
                start--;
                this.value.start = start;
                var tmp = dojo.byId('selection').previousSibling;
                dojo.place(tmp, dojo.byId('selection'), 'first');
                var curr = (dojo.attr(tmp,'style') == null) ? '' : dojo.attr(tmp,'style');
                dojo.attr(tmp,'style',curr+'background-color:#99CCFF;');   
            }
        }
        this._lock = false;  
    };
    
    // Move caret right one char & custom render
    proto.moveCaretRight = function(select) {
        var start = (this.value.start<this.value.end) ? this.value.start : this.value.end;
        var end = (this.value.end>this.value.start) ? this.value.end : this.value.start;

        if(!select){
            if(dojo.byId('selection').childNodes.length > 0){
                this.clearSelection('right');
            }else{
                if(end<this.value.string.length){
                    end++;
                    start = end;
                    this.value.start = start;
                    this.value.end = end;
                    var tmp = dojo.byId('selection').nextSibling;
                    dojo.place(tmp, dojo.byId('selection'), 'before');
                }
            }
        }else{
            if(end<this.value.string.length){
                end++;
                this.value.end = end;
                var tmp = dojo.byId('selection').nextSibling;
                dojo.place(tmp, dojo.byId('selection'), 'last');
                var curr = (dojo.attr(tmp,'style') == null) ? '' : dojo.attr(tmp,'style');
                dojo.attr(tmp,'style',curr+'background-color:#99CCFF;');   
            }
        }
        this._lock = false;  
    };
    
    proto._listenForKeyCombo = function(e) {
        //Current limitations: only works with COMMAND / CTRL + key
        //1. Listen for command / ctrl cross-browser
        if((e.which == 224) || (e.which == 91) || (e.which == 17)){
            
            //2. Put current selection in hidden div, change focus
            var sel = this._stripTags(this._stripSpaces(this._replaceBR(dojo.byId('selection').innerHTML)));
            this._hidden = dojo.create('textarea',{
                id:'hidden',
                style:'position:absolute;left:-10000px;top:200px;',
                innerHTML: sel
            },this.container,'before');

            document.getElementById('hidden').focus();
            document.getElementById('hidden').select();
            
            //3. Listen for v or a, paste or selectAll respectively
            if(dojo.isChrome){
                this._chromeKeyCombo();
            }else{
                this._universalKeyCombo();
            }
        }
    };
    
    proto._connect = function(){
        dojo.connect(window, 'resize', this, '_resize');
        dojo.connect(this.div, 'onmousedown', this, '_onMouseDown');
        dojo.connect(this.div, 'onmouseup', this, '_onClick');
        dojo.connect(this.div, 'onfocus', this, '_onFocus');
        dojo.connect(this.div, 'onblur', this, '_onBlur');
        dojo.connect(this.div, 'onkeypress', this, 'onKeyPress');
        dojo.connect(this.div, 'onkeydown', this, '_listenForKeyCombo');
        dojo.subscribe("hideAll", dojo.hitch(this, function(message){ this._hidePalette(); }));
        document.onkeydown = this._overrideKeys;
    };
    
    proto._connectSyncs = function() {
        this.collab = coweb.initCollab({id : this.id});
        this.collab.subscribeSync('editorBold', this, '_onRemoteStyle');
        this.collab.subscribeSync('editorItalic', this, '_onRemoteStyle');
        this.collab.subscribeSync('editorUnderline', this, '_onRemoteStyle');
        this.collab.subscribeSync('editorStrikethrough', this, '_onRemoteStyle');
        this.collab.subscribeSync('editorForeColor', this, '_onRemoteStyle');
        this.collab.subscribeSync('editorHiliteColor', this, '_onRemoteStyle');
        this.collab.subscribeSync('editorTitle', this, '_onRemoteTitle');
    };
    
    proto._style = function(){
        this._loadTemplate('../lib/cowebx/dojo/RichTextEditor/textarea.css');
        if(dojo.isMozilla){
            dojo.style('footerDiv','top','3px');
        }else{
            dojo.style('footerDiv','top','-25px');
        }
    };
    
    proto._chromeKeyCombo = function() {
        this._c = dojo.connect(this._hidden, 'onkeydown', this,function(e){
            //Paste
            if(e.which == 86){
                this.t = setTimeout(dojo.hitch(this, function(){
                    var text = this._hidden.value;
                    this.insert(text, true);
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
                this._delete();
            }
            
            setTimeout(dojo.hitch(this, function(){
                dojo.disconnect(this._c);
                dojo.destroy(this._hidden);
                this.div.focus();
                //this.getCharObj(true);
            }), 100);
        });  
    };
    
    proto._universalKeyCombo = function() {
        this._c = dojo.connect(this._hidden, 'onkeypress', this,function(e){
            //Paste
            if(e.which == 118){
                this.t = setTimeout(dojo.hitch(this, function(){
                    var text = this._hidden.value;
                    this.insert(text, true);
                }), 100);
            //selectAll
            }else if((e.which == 97) || (e.which == 65)){
                this.selectAll();
            //Copy
            }else if(e.which == 99){
                this._pause(100);
            //Cut
            }else if(e.which == 120){
                this._pause(100);
                this._delete();
            }
            setTimeout(dojo.hitch(this, function(){
                dojo.disconnect(this._c);
                dojo.destroy(this._hidden);
                this.div.focus();
                //this.getCharObj(true);
            }), 100);
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
    
    proto._isPiL = function(points, pt){
        var y = 0;
        
        if(pt.y <= points.bottom && pt.y >= points.top)
            y = 1;
        if(y==1){
            return true;
        }else{
            return false;
        }
    };
    
    proto._loadTemplate = function(url) {
       var e = document.createElement("link");
       e.href = url;
       e.type = "text/css";
       e.rel = "stylesheet";
       e.media = "screen";
       document.getElementsByTagName("head")[0].appendChild(e);
    };
    
    proto._blink = function(){
        if(this.displayCaret){
            if(this._caret == true){
                dojo.attr('selection', 'style', dojo.attr('selection','style').replace('border-left:1px solid black;','border-left:1px solid white;'));
                this._caret = false;
            }else{
                dojo.attr('selection', 'style', dojo.attr('selection','style').replace('border-left:1px solid white;','border-left:1px solid black;'));
                this._caret = true;
            }
        }
    };
    
    proto._overrideKeys = function(e) {
        //Backspace
        if (e.which == 8)
			return false;
    };
    
    proto._replaceBR = function(string){
        var s = string.replace(new RegExp("<br>", 'g'),'^');
        return s;
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
        for(var i in obj)
            count++;
        return count;
    };
    
    proto._pause = function(millis){
        var date = new Date();
        var curDate = null;
        do { curDate = new Date(); }
        while(curDate-date < millis);
    };
    
    proto._scrollWith = function(){
        // var a = dojo.byId('selection');
        //         if(a.previousSibling && a.previousSibling.innerHTML != '&nbsp; ')
        //             dojo.byId('divHolder').scrollTop = dojo.byId('selection').offsetTop;
    };
    
    proto._renderLineNumbers = function(){
        if(!this._lineHeight){
            var a = dojo.create('div',{innerHTML:'G'},this.frame,'first');
            this._lineHeight = dojo.style(a, 'height');
            dojo.destroy(a);
        }

        if(!this._prevLines)
            this._prevLines = 0;
        var contentHeight = dojo.style(this.frame, 'height');
        var lines = Math.floor(contentHeight / this._lineHeight);
        if(this._prevLines < lines){
            var diff = lines - this._prevLines;
            var div = dojo.byId('lineNumbers');
            for(var i=1; i<=diff; i++){
                dojo.create('span',{style:'color:grey;visibility:hidden;',innerHTML:i+this._prevLines,id:i+this._prevLines+'a'},div,'last');
                dojo.create('span',{'class':'line',innerHTML:i+this._prevLines,id:i+this._prevLines+'b'},div,'last');
                dojo.create('br',{id:i+this._prevLines+'c'},div,'last');
            }
            this._prevLines = lines;
        }else if(this._prevLines > lines){
            var diff = Math.abs(lines - this._prevLines);
            var div = dojo.byId('lineNumbers');
            var n = this._prevLines+0;
            for(var i=0; i<diff; i++){
                dojo.destroy(div.lastChild);
                dojo.destroy(div.lastChild);
                dojo.destroy(div.lastChild);
            }
            this._prevLines = lines;
        }
    };    
    
    proto._hidePalette = function(){
		dojo.style(this._palette.domNode, 'display', 'none');
		dojo.style(this._bgPalette.domNode, 'display', 'none');
		this._hilitecolor = false;
		this._forecolor = false;
	};
    
    proto._buildToolbar = function(){
        var toolbarNode = dojo.create('div',{style:'width:100%;height:50px;'},this.container,'first');
        var toolbar = new Toolbar({},toolbarNode);
        dojo.attr(toolbar.domNode, 'class', 'gradient header');
        
        //1. Home button
        var home = new ToggleButton({
            label: '<img style="width:18px;height:18;" src="../lib/cowebx/dojo/RichTextEditor/images/home.png"/>',
            showLabel: true,
            id: 'homeButton'
        });
        toolbar.addChild(home);
        this.homeButton = home;
        dojo.connect(home, 'onclick', this, '_onHomeClick');
        dojo.attr(home.domNode, 'style', 'border-bottom:3px solid black');
        dojo.style('homeButton_label', 'padding', '0px');
        
        //2. NewPage, Save
        dojo.forEach(["NewPage", "Save"], dojo.hitch(this, function(label) {
            var button = new ToggleButton({
                label: label,
                showLabel: false,
                iconClass: "dijitEditorIcon dijitEditorIcon" + label
            });
            this[label] = button;
            toolbar.addChild(button);
            dojo.connect(button, 'onclick', this, '_on'+label+'Click');
            dojo.attr(this[label].domNode, 'style', 'border-bottom:3px solid black');
        }));
        
        //3. Duplicate button
        var dup = new ToggleButton({
            label: '<img style="width:18px;height:18;" src="../lib/cowebx/dojo/RichTextEditor/images/duplicate.png"/>',
            showLabel: true,
            id: 'dupButton'
        });
        toolbar.addChild(dup);
        this.duplicateButton = dup;
        dojo.connect(dup, 'onclick', this, '_onDuplicateClick');
        dojo.attr(dup.domNode, 'style', 'border-bottom:3px solid black');
        dojo.style('dupButton_label', 'padding', '0px');
        var sep = new Separator({});
        toolbar.addChild(sep);
        
        //3. Bold, italic, underline, strikethrough
        dojo.forEach(["Bold", "Italic", "Underline", "Strikethrough"], dojo.hitch(this, function(label) {
            var button = new ToggleButton({
                label: label,
                showLabel: false,
                iconClass: "dijitEditorIcon dijitEditorIcon" + label
            });
            this[label] = button;
            toolbar.addChild(button);
            dojo.connect(button, 'onclick', this, '_on'+label+'Click');
            dojo.attr(this[label].domNode, 'style', 'border-bottom:3px solid black');
        }));
        var sep = new Separator({});
        toolbar.addChild(sep);
        
        //4. Colors
        dojo.forEach(["ForeColor", "HiliteColor"], dojo.hitch(this, function(label) {
            var button = new ToggleButton({
                label: label,
                showLabel: false,
                iconClass: "dijitEditorIcon dijitEditorIcon" + label
            });
            this[label] = button;
            toolbar.addChild(button);
            dojo.connect(button, 'onclick', this, '_on'+label+'Click');
            dojo.attr(this[label].domNode, 'style', 'border-bottom:3px solid black');
        }));
        var sep = new Separator({});
        toolbar.addChild(sep);
        
        //5. Slider
        if(!this.noSlider || this.noSlider == false){
            var button = new ToggleButton({
                label: '<span style="font-family:Arial;font-size:14px;"><img src="../lib/cowebx/dojo/RichTextEditor/images/history.png" style="height:20px;width:20px;margin-right:3px"/>History</span>',
                showLabel: true,
                id: 'sliderButton'
            });
            toolbar.addChild(button);
            this.sliderButton = button;
            dojo.connect(button, 'onclick', this, '_onSliderClick');
            dojo.attr(button.domNode, 'style', 'border-bottom:3px solid black');
            dojo.style(button.domNode, 'float', 'right');
        }
        
        //Color pallettes
        var paletteNode = dojo.create('div',{style:'width:100%;'},toolbar.domNode,'after');
        this._palette = new ColorPalette({style:'position:fixed;display:none;left:295px'},paletteNode);
        dojo.connect(this._palette, 'onChange', this, '_onForeColorChange');
        var bgPaletteNode = dojo.create('div',{style:'width:100%;'},toolbar.domNode,'after');
        this._bgPalette = new ColorPalette({style:'position:fixed;display:none;left:330px'},bgPaletteNode);
        dojo.connect(this._bgPalette, 'onChange', this, '_onHiliteColorChange');
        
        return toolbar;
    };
    
    proto._buildTable = function(){
        this._div = dojo.create('div', {'style':'width:100%;height:100%;overflow-y:auto;',id:'divHolder'}, this.container);
        var table = dojo.create('table',{'style':'width:100%;border-spacing:0px;border-collapse:true;height:100%;'},this._div);
        var tr = dojo.create('tr',{'style':'width:100%;height:100%;'},table);
        var td1 = dojo.create('td',{'style':'width:20px;height:100%;'},tr,'first');
        var td2 = dojo.create('td',{'style':'height:100%;'},tr,'last');
        var d = dojo.create('div', {tabindex:-1,id:'thisDiv','class':'div'}, td2);
        var l = dojo.create('div', {id:'lineNumbers','class':'lineNumbers'}, td1);
        
        return d;
    };
    
    proto._buildFooter = function(){
        var footerNode = dojo.create('div',{'class':'footer gradient'},this.container,'last');
        var div = dojo.create('div',{'class':'footerDiv',id:'footerDiv'},footerNode,'first');
        var color = dojo.create('div',{'class':'color',style:'background-color:'+this.localColor},footerNode,'first');
        var title = dojo.create('span',{'class':'title',innerHTML:'Untitled Document'},footerNode,'first');
        dojo.connect(title, 'onclick', this, function(e){
            dojo.style(e.target, 'background', 'white');
            e.target.innerHTML = '';
            e.target.contentEditable = true;
            e.target.focus();
        });
        dojo.connect(title, 'onblur', this, function(e){
            this.title = (e.target.innerHTML.length > 0) ? e.target.innerHTML : this.title;
            e.target.innerHTML = this.title;
            e.target.contentEditable = false;
            dojo.style(e.target, 'background', '');
            this.collab.sendSync('editorTitle', {'title':e.target.innerHTML}, null);   
        });
        var edit = dojo.create('img',{src:'../lib/cowebx/dojo/RichTextEditor/images/pencil.png','class':'editIcon'},title,'after');
        dojo.connect(title, 'onkeypress', this, function(e){
            if(e.keyCode == 8){
                dojo.attr(e.target, 'innerHTML', '');
            } 
        });
        this._title = title;
        var line = dojo.create('span',{style:'float:left',innerHTML:'Line: '+'<span id="line">0</span>'},div,'last');
        var col = dojo.create('span',{style:'float:right;',innerHTML:'Col: '+'<span id="col">0</span>'},div,'last');
        
        return footerNode;
    };
    
    proto._buildConfirmDialog = function(){
        secondDlg = new Dialog({
            title: "Are you sure?",
            style: "width: 300px;font:12px arial;"
        });
        var h = dojo.create('div',{'style':'margin-left:auto;margin-right:auto;width:80px;margin-bottom:5px'},secondDlg.domNode,'last');
        var yes = new ToggleButton({
            label: '<span style="font-family:Arial;font-size:10px;">Yes</span>',
            showLabel: true,
            id: 'yesButton'
        });
        var no = new ToggleButton({
            label: '<span style="font-family:Arial;font-size:10px;">No</span>',
            showLabel: true,
            id: 'noButton'
        });
        dojo.place(yes.domNode, h, 'last');
        dojo.place(no.domNode, h, 'last');
        return secondDlg
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
            if(this._bold == false){
                this._bold = true;
                this.filters.push('font-weight:bold;');
                dojo.attr(this.Bold.domNode, 'style', 'border-bottom:3px solid red');
            }else{
                this._bold = false;
                this.filters[dojo.indexOf(this.filters,'font-weight:bold;')] = '';
                dojo.attr(this.Bold.domNode, 'style', 'border-bottom:3px solid black');
            }
        }else{
            if(this._hold == false){
                var x=0;
                for(var i=start; i<end; i++){
                    if(dojo.indexOf(this.value.string[i]['filters'],'font-weight:bold;') == -1){
                        this.value.string[i]['filters'].push('font-weight:bold;');
                        var tmp = dojo.byId('selection').childNodes[x];
                        var curr = (dojo.attr(tmp,'style') == null) ? '' : dojo.attr(tmp,'style');
                        dojo.attr(tmp,'style',curr+'font-weight:bold;');
                    }
                    x++;
                }
                this._hold = true;
                this.collab.sendSync('editorBold', {'string':this.value.string}, null);   
            }else if(this._hold == true && this._lastOp == 'bold'){
                var x=0;
                for(var i=start; i<end; i++){
                    if(dojo.indexOf(this.value.string[i]['filters'],'font-weight:bold;') == -1){
                        this.value.string[i]['filters'].push('font-weight:bold;'); 
                        var tmp = dojo.byId('selection').childNodes[x];
                        var curr = (dojo.attr(tmp,'style') == null) ? '' : dojo.attr(tmp,'style');
                        dojo.attr(tmp,'style',curr+'font-weight:bold;');
                    }else{
                        this.value.string[i]['filters'][dojo.indexOf(this.value.string[i]['filters'],'font-weight:bold;')] = '';
                        var tmp = dojo.byId('selection').childNodes[x];
                        if(dojo.attr(tmp, "style"))
                            dojo.attr(tmp,'style', dojo.attr(tmp,'style').replace('font-weight:bold;',''));
                    }
                    x++;
                }
                this._hold = true;
                this.collab.sendSync('editorBold', {'string':this.value.string}, null);
            }
        }
        this._lastOp = 'bold';
        this.div.focus();
        dojo.publish("editorHistory", [{save:dojo.clone(this.value)}]);
    };
    
    proto._onItalicClick = function() {
        if(this._lastOp != 'italic')
            this._hold = false;
        var start = (this.value.start<this.value.end) ? this.value.start : this.value.end;
        var end = (this.value.end>=this.value.start) ? this.value.end : this.value.start;
        if(start == end){
            if(this._italic == false){
                this._italic = true;
                this.filters.push('font-style:italic;');
                dojo.attr(this.Italic.domNode, 'style', 'border-bottom:3px solid red');
            }else{
                this._italic = false;
                this.filters[dojo.indexOf(this.filters,'font-style:italic;')] = '';
                dojo.attr(this.Italic.domNode, 'style', 'border-bottom:3px solid black');
            }
        }else{
            if(this._hold == false){
                var x=0;
                for(var i=start; i<end; i++){
                    if(dojo.indexOf(this.value.string[i]['filters'],'font-style:italic;') == -1){
                        this.value.string[i]['filters'].push('font-style:italic;');
                        var tmp = dojo.byId('selection').childNodes[x];
                        var curr = (dojo.attr(tmp,'style') == null) ? '' : dojo.attr(tmp,'style');
                        dojo.attr(tmp,'style',curr+'font-style:italic;');
                    }
                    x++;
                }
                this._hold = true;
                this.collab.sendSync('editorItalic', {'string':this.value.string}, null);   
            }else if(this._hold == true && this._lastOp == 'italic'){
                var x=0;
                for(var i=start; i<end; i++){
                    if(dojo.indexOf(this.value.string[i]['filters'],'font-style:italic;') == -1){
                        this.value.string[i]['filters'].push('font-style:italic;'); 
                        var tmp = dojo.byId('selection').childNodes[x];
                        var curr = (dojo.attr(tmp,'style') == null) ? '' : dojo.attr(tmp,'style');
                        dojo.attr(tmp,'style',curr+'font-style:italic;');
                    }else{
                        this.value.string[i]['filters'][dojo.indexOf(this.value.string[i]['filters'],'font-style:italic;')] = '';
                        var tmp = dojo.byId('selection').childNodes[x];
                        if(dojo.attr(tmp, "style"))
                            dojo.attr(tmp,'style', dojo.attr(tmp,'style').replace('font-style:italic;',''));
                    }
                    x++;
                }
                this._hold = true;
                this.collab.sendSync('editorItalic', {'string':this.value.string}, null);
            }
        }
        this._lastOp = 'italic';
        this.div.focus();
        dojo.publish("editorHistory", [{save:dojo.clone(this.value)}]);
    };
    
    proto._onUnderlineClick = function() {
        if(this._lastOp != 'underline')
            this._hold = false;
        var start = (this.value.start<this.value.end) ? this.value.start : this.value.end;
        var end = (this.value.end>=this.value.start) ? this.value.end : this.value.start;
        if(start == end){
            if(this._underline == false){
                this._underline = true;
                this.filters.push('text-decoration:underline;');
                dojo.attr(this.Underline.domNode, 'style', 'border-bottom:3px solid red');
            }else{
                this._underline = false;
                this.filters[dojo.indexOf(this.filters,'text-decoration:underline;')] = '';
                dojo.attr(this.Underline.domNode, 'style', 'border-bottom:3px solid black');
            }
        }else{
            if(this._hold == false){
                var x=0;
                for(var i=start; i<end; i++){
                    if(dojo.indexOf(this.value.string[i]['filters'],'text-decoration:underline;') == -1){
                        this.value.string[i]['filters'].push('text-decoration:underline;');
                        var tmp = dojo.byId('selection').childNodes[x];
                        var curr = (dojo.attr(tmp,'style') == null) ? '' : dojo.attr(tmp,'style');
                        dojo.attr(tmp,'style',curr+'text-decoration:underline;');
                    }
                    x++;
                }
                this._hold = true;
                this.collab.sendSync('editorUnderline', {'string':this.value.string}, null);   
            }else if(this._hold == true && this._lastOp == 'underline'){
                var x=0;
                for(var i=start; i<end; i++){
                    if(dojo.indexOf(this.value.string[i]['filters'],'text-decoration:underline;') == -1){
                        this.value.string[i]['filters'].push('text-decoration:underline;'); 
                        var tmp = dojo.byId('selection').childNodes[x];
                        var curr = (dojo.attr(tmp,'style') == null) ? '' : dojo.attr(tmp,'style');
                        dojo.attr(tmp,'style',curr+'text-decoration:underline;');
                    }else{
                        this.value.string[i]['filters'][dojo.indexOf(this.value.string[i]['filters'],'text-decoration:underline;')] = '';
                        var tmp = dojo.byId('selection').childNodes[x];
                        if(dojo.attr(tmp, "style"))
                            dojo.attr(tmp,'style', dojo.attr(tmp,'style').replace('text-decoration:underline;',''));
                    }
                    x++;
                }
                this._hold = true;
                this.collab.sendSync('editorUnderline', {'string':this.value.string}, null);
            }
        }
        this._lastOp = 'underline';
        this.div.focus();
        dojo.publish("editorHistory", [{save:dojo.clone(this.value)}]);
    };
    
    proto._onStrikethroughClick = function() {
        if(this._lastOp != 'strikethrough')
            this._hold = false;
        var start = (this.value.start<this.value.end) ? this.value.start : this.value.end;
        var end = (this.value.end>=this.value.start) ? this.value.end : this.value.start;
        if(start == end){
            if(this._strikethrough == false){
                this._strikethrough = true;
                this.filters.push('text-decoration:line-through;');
                dojo.attr(this.Strikethrough.domNode, 'style', 'border-bottom:3px solid red');
            }else{
                this._strikethrough = false;
                this.filters[dojo.indexOf(this.filters,'text-decoration:line-through;')] = '';
                dojo.attr(this.Strikethrough.domNode, 'style', 'border-bottom:3px solid black');
            }
        }else{
            if(this._hold == false){
                var x=0;
                for(var i=start; i<end; i++){
                    if(dojo.indexOf(this.value.string[i]['filters'],'text-decoration:line-through;') == -1){
                        this.value.string[i]['filters'].push('text-decoration:line-through;');
                        var tmp = dojo.byId('selection').childNodes[x];
                        var curr = (dojo.attr(tmp,'style') == null) ? '' : dojo.attr(tmp,'style');
                        dojo.attr(tmp,'style',curr+'text-decoration:line-through;');
                    }
                    x++;
                }
                this._hold = true;
                this.collab.sendSync('editorStrikethrough', {'string':this.value.string}, null);   
            }else if(this._hold == true && this._lastOp == 'strikethrough'){
                var x=0;
                for(var i=start; i<end; i++){
                    if(dojo.indexOf(this.value.string[i]['filters'],'text-decoration:line-through;') == -1){
                        this.value.string[i]['filters'].push('text-decoration:line-through;'); 
                        var tmp = dojo.byId('selection').childNodes[x];
                        var curr = (dojo.attr(tmp,'style') == null) ? '' : dojo.attr(tmp,'style');
                        dojo.attr(tmp,'style',curr+'text-decoration:line-through;');
                    }else{
                        this.value.string[i]['filters'][dojo.indexOf(this.value.string[i]['filters'],'text-decoration:line-through;')] = '';
                        var tmp = dojo.byId('selection').childNodes[x];
                        if(dojo.attr(tmp, "style"))
                            dojo.attr(tmp,'style', dojo.attr(tmp,'style').replace('text-decoration:line-through;',''));
                    }
                    x++;
                }
                this._hold = true;
                this.collab.sendSync('editorStrikethrough', {'string':this.value.string}, null);
            }
        }
        this._lastOp = 'strikethrough';
        this.div.focus();
        dojo.publish("editorHistory", [{save:dojo.clone(this.value)}]);
    };
    
    proto._onForeColorClick = function() {
        if(this._forecolor == false){
            dojo.style(this._bgPalette.domNode, 'display', 'none');
            dojo.style(this._palette.domNode, 'display', 'block');
            this._forecolor = true;
            this._hilitecolor = false;
        }else if(this._forecolor){
            dojo.style(this._palette.domNode, 'display', 'none');
            this._forecolor = false;
        }
    };
    
    proto._onForeColorChange = function(color) {
        var start = (this.value.start<this.value.end) ? this.value.start : this.value.end;
        var end = (this.value.end>=this.value.start) ? this.value.end : this.value.start;
        
        if(start == end){
            if((this._prevForeColor == null || undefined) || (dojo.indexOf(this.filters,'color:'+this._prevForeColor+';') == -1)){
                
            }else if(this._prevForeColor){
                this.filters[dojo.indexOf(this.filters,'color:'+this._prevForeColor+';')] = '';
            }
            this.filters.push('color:'+color+';');
            this._prevForeColor = color;
            dojo.attr(this.ForeColor.domNode, 'style', 'border-bottom:3px solid '+color);
        }else{
            var x=0;
            for(var i=start; i<end; i++){
                var tmp = dojo.byId('selection').childNodes[x];
                for(var j=0; j<this._pastForeColors.length; j++){
                    if(dojo.indexOf(this.value.string[i]['filters'],'color:'+this._pastForeColors[j]+';') != -1){
                        this.value.string[i]['filters'][dojo.indexOf(this.value.string[i]['filters'],'color:'+this._pastForeColors[j]+';')] = '';
                        if(dojo.attr(tmp, "style"))
                            dojo.attr(tmp,'style', dojo.attr(tmp,'style').replace('color:'+this._pastForeColors[j]+';',''));
                    }
                }
                this.value.string[i]['filters'].push('color:'+color+';'); 
                var curr = (dojo.attr(tmp,'style') == null) ? '' : dojo.attr(tmp,'style');
                dojo.attr(tmp,'style',curr+'color:'+color+';');
                x++;
            }
            this.collab.sendSync('editorForeColor', {'string':this.value.string}, null);
        }

        this._pastForeColors.push(color);
        this.div.focus();
        this._hidePalette();
        dojo.publish("editorHistory", [{save:dojo.clone(this.value)}]);
    };
    
    proto._onHiliteColorClick = function() {
        if(this._hilitecolor == false){
            dojo.style(this._palette.domNode, 'display', 'none');
            dojo.style(this._bgPalette.domNode, 'display', 'block');
            this._hilitecolor = true;
            this._forecolor = false;
        }else if(this._hilitecolor){
            dojo.style(this._bgPalette.domNode, 'display', 'none');
            this._hilitecolor = false;
        }
    };
    
    proto._onHiliteColorChange = function(color) {
        var start = (this.value.start<this.value.end) ? this.value.start : this.value.end;
        var end = (this.value.end>=this.value.start) ? this.value.end : this.value.start;
        
        if(start == end){
            if((this._prevHiliteColor == null || undefined) || (dojo.indexOf(this.filters,'background:'+this._prevHiliteColor+';') == -1)){
                
            }else if(this._prevHiliteColor){
                this.filters[dojo.indexOf(this.filters,'background:'+this._prevForeColor+';')] = '';
            }
            this.filters.push('background:'+color+';');
            this._prevHiliteColor = color;
            dojo.attr(this.HiliteColor.domNode, 'style', 'border-bottom:3px solid '+color);
        }else{
            var x=0;
            for(var i=start; i<end; i++){
                var tmp = dojo.byId('selection').childNodes[x];
                if(this.value.string[i]['filters'] == undefined){
                    this.value.string[i]['filters'] = [];
                }
                for(var j=0; j<this._pastHiliteColors.length; j++){
                    if(dojo.indexOf(this.value.string[i]['filters'],'background:'+this._pastHiliteColors[j]+';') != -1){
                        this.value.string[i]['filters'][dojo.indexOf(this.value.string[i]['filters'],'background:'+this._pastHiliteColors[j]+';')] = '';
                        if(dojo.attr(tmp, "style"))
                            dojo.attr(tmp,'style', dojo.attr(tmp,'style').replace('background:'+this._pastHiliteColors[j]+';',''));
                    }
                }
                this.value.string[i]['filters'].push('background:'+color+';'); 
                var curr = (dojo.attr(tmp,'style') == null) ? '' : dojo.attr(tmp,'style');
                dojo.attr(tmp,'style',curr+'background:'+color+';');
                x++;
            }
            this.collab.sendSync('editorHiliteColor', {'string':this.value.string}, null);
        }
        
        this._pastHiliteColors.push(color);
        this.div.focus();
        this._hidePalette();
        dojo.publish("editorHistory", [{save:dojo.clone(this.value)}]);
    };

    proto._onNewPageClick = function() {
        this.dialog.set('content', "You may lose data if you are the only user in the current session. Do you really want to start a new Document?");
        this.dialog.show();
        var one = dojo.connect(dojo.byId('yesButton'),'onclick',this, function(){
            window.location = window.location.pathname+'?'+'session='+Math.floor(Math.random()*10000001);
            dojo.disconnect(one);
            dojo.disconnect(two);
        });
        var two = dojo.connect(dojo.byId('noButton'),'onclick',this, function(){
            this.dialog.hide();
            dojo.disconnect(one);
            dojo.disconnect(two);
        });
        var three = dojo.connect(this.dialog, 'onHide', this, function(){
            dojo.disconnect(one);
            dojo.disconnect(two);
            dojo.disconnect(three);
        });
    };
    
    proto._onSaveClick = function() {
         dojo.publish("shareClick", [{}]);
    };
    
    proto._onHomeClick = function() {
        this.dialog.set('content', "You may lose data if you are the only user in the current session. Do you really want to go to Home?");
        this.dialog.show();
        var one = dojo.connect(dojo.byId('yesButton'),'onclick',this, function(){
            window.location = window.location.pathname;
        });
        var two = dojo.connect(dojo.byId('noButton'),'onclick',this, function(){
            this.dialog.hide();
            dojo.disconnect(one);
            dojo.disconnect(two);
        });
        var three = dojo.connect(this.dialog, 'onHide', this, function(){
            dojo.disconnect(one);
            dojo.disconnect(two);
            dojo.disconnect(three);
        });
    };
    
    proto._onDuplicateClick = function() {
        window.open(window.location);
    };
    
    proto._onSliderClick = function(){
        dojo.publish("sliderToggle", [{}]);
    };
    
    proto._onRemoteTitle = function(obj){
        this.title = obj.value.title;
        this._title.innerHTML = this.title;
    };
    
    proto._resize = function(initial) {
        //Style on resize as a late hook, fix eventually
        dojo.attr('thisDiv','style','background:white;cursor:text;z-index:1000;height:100%;min-height:100%;');
        dojo.attr('lineNumbers','style','width:auto;height:100%;background:grey;min-width:30px;');
        dojo.style(this._div, 'height', (window.innerHeight-70)+'px');
    };

    proto._onMouseDown = function(e){
        this._endNode = e.target;
    };
    
    proto._onClick = function(e){
        var startNode = e.target;
        var endNode = this._endNode;
        if(this.value.start != this.value.end)
            this.clearSelection();
        var i=0; j=0;
        var start = null;
        var end = null;
        
        //Point in Polygon to find selection Start
        dojo.query("#thisDiv span,#thisDiv br").forEach(dojo.hitch(this, function(node, index, arr){
            if(node.id != 'selection'){
                i++; j++;
                if(startNode == node)
                    start = i;
                if(endNode == node)
                    end = j;
            }
        }));
        
        //Backup if no matches: is Point in Line? Go to end if so...
        if(start == null && end == null){
            console.log(this.value);
        }
                        
        if(start && end){
            this.value.start = start;
            this.value.end = end;
            this.render(true);
        }
    };
    
    proto._onFocus = function(e){
        this.displayCaret = true;
        if(dojo.byId('hidden'))
            dojo.destroy('hidden');
        dojo.publish("hideAll", [{}]);
    };
    
    proto._onBlur = function(){
        this.displayCaret = false;
    };
    
    return textarea;
});