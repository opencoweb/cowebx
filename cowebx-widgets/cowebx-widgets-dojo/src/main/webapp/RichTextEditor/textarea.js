define([
    'coweb/main',
    'dijit/Toolbar',
    'dijit/form/ToggleButton',
    'dijit/ToolbarSeparator',
    'dijit/Dialog',
    'cowebx/dojo/ShareButton/Button',
    'dijit/ColorPalette'
], function(coweb, Toolbar, ToggleButton, Separator, Dialog, Button, ColorPalette) {
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
        this.toolbar        =   this._buildToolbar();
        this.footer         =   this._buildFooter();
        this.before         =   dojo.create('span',{id:'before'},this.div,'first');
        this.selection      =   dojo.create('span',{id:'selection'},this.div,'last');
        this.after          =   dojo.create('span',{id:'after','style':'border-left: 1px solid white;'},this.div,'last');
        this.dialog         =   this._buildConfirmDialog();
        this.shareButton    =   this._buildShareButton();
        
        //3. Style and connect
        this._style();
        this._connect();
        this._connectSyncs();
        this._resize(true);
        setInterval(dojo.hitch(this, '_blink'), 500);
        
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
        
        this.getCharObj();
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
            if(this.value.string[this.value.start-1]['char'] == ' ')
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
        this.getCharObj(reset);
    };

    // Rips through this.value and blasts proper html equiv into dom
    proto.render = function(slider) {
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
        
        if(!slider || slider==false){
            //Save history
            var copy = dojo.clone(this.value);
            dojo.publish("editorHistory", [{save:copy}]);
        }
        
        this._scrollWith();
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
        var o = 0;
        dojo.query("#thisDiv span").forEach(dojo.hitch(this, function(node, index, arr){
            if(dojo.indexOf(ignore,node.id) == -1){
                o++;
                var pos = this._findPos(node);
                if(pos.top == currY){
                    count++;
                    this.rows[row] = count;
                }else{
                    if(prev != null && prev.innerHTML == '&nbsp; '){
                        if(node.previousSibling == null){
                           this._forceIndex = true;
                           dojo.create('br',{},prev,'after');
                           dojo.destroy(prev);
                           this.rows[row] = this.rows[row]-1;
                        }else if((node.previousSibling.tagName != 'BR')){
                            dojo.create('br',{},prev,'after');
                            dojo.destroy(prev);
                            this.rows[row] = this.rows[row]-1;
                        }
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
        if(this.currLineIndex == undefined || this._forceIndex){
            this.currLineIndex = 0;
            this._forceIndex = false;
        }
        this.currLine = this._findLine();
        
        if(set && set==true)
            this.lastIndex = this.currLineIndex;
        
        dojo.attr('line','innerHTML',this.currLine);
        dojo.attr('col','innerHTML',this.currLineIndex);
        this._hold = false;
        
        this._renderLineNumbers();
    };
    
    // Insert single char at this.value.start
    proto.insert = function(c, paste) {
        var start = (this.value.start<this.value.end) ? this.value.start : this.value.end;
        var end = (this.value.end>=this.value.start) ? this.value.end : this.value.start;
        var v = this.value;
        
        if(start != end){
            v.string = v.string.slice(0,start).concat(v.string.slice(end,v.string.length));
            this.clearSelection();
        }
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
        this.render();
    };
    
    // Remove n chars at this.value.start
    proto._delete = function(n) {
        var start = (this.value.start<this.value.end) ? this.value.start : this.value.end;
        var end = (this.value.end>=this.value.start) ? this.value.end : this.value.start;
        var v = this.value;
        if(!n)
            var n = 1;
        
        if(start != end){
            v.string = v.string.slice(0,start).concat(v.string.slice(end,v.string.length));
            this.clearSelection();
        }else{
            var beforeLength = v.string.length+0;
            v.string = v.string.slice(0,v.start-n).concat(v.string.slice(v.start,v.string.length));
            var afterLength = v.string.length+0;
            if(beforeLength != afterLength){
                v.start = v.start - n;
                v.end = v.start;
            }
        }
        this.render();
    };

    // Clears current selection
    proto.clearSelection = function() {
        var v = this.value;
        if(v.end < v.start){
            v.start = v.end
        }else{
            v.end = v.start;
        }
    };
    
    // Select all text
    proto.selectAll = function() {
        var v = this.value;
        v.end=0; 
        v.start=v.string.length;
        this.render();
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
        this.render();
        this.getCharObj(true);
    };
    
    // Move caret up one line
    proto.moveCaretUp = function(select) {
        var amt = 0;
        //1. Get to the beginning of the line
        amt = amt + this.currLineIndex;
        
        //2. Go to next line if it exists
        if(this.rows[this.currLine-1] != undefined)
            amt = amt + 1;
        
        //3. Go to the lastIndex if we can
        if(this.rows[this.currLine-1] != undefined){
            if(this.rows[this.currLine-1] >= this.lastIndex)
                amt = amt + (this.rows[this.currLine-1] - this.lastIndex);
        }
        
        this.value.start = this.value.start - amt;
        if(!select)
            this.value.end = this.value.start;

        this.render();
    };
    
    // Move caret down one line
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
    
    // Move caret left one char
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
    
    // Move caret right one char
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
    
    // Set caret pos
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
    
    proto._listenForKeyCombo = function(e) {
        //Current limitations: only works with COMMAND / CTRL + key
        //1. Listen for command / ctrl cross-browser
        if((e.which == 224) || (e.which == 91) || (e.which == 17)){
            
            //2. Put current selection in hidden div, change focus
            var sel = this._stripSpaces(this._stripTags(this.selection.innerHTML));
            this._hidden = dojo.create('textarea',{
                id:'hidden',
                style:'position:absolute;left:-10000px;top:0px;',
                innerHTML: sel
            },this.div,'after');
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
        var line = Math.floor(((top-currY)/lineHeight)+1);
        if(lineHeight == 0)
            return 0;
        return line;
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
                var end = (this.value.end>=this.value.start) ? this.value.end : this.value.start;
                var len = this._stripSpaces(this._stripTags(this.selection.innerHTML)).length;
                this.value.start = end;
                this._delete(len);
            }
            
            setTimeout(dojo.hitch(this, function(){
                dojo.disconnect(this._c);
                dojo.destroy(this._hidden);
                this.div.focus();
                this.getCharObj(true);
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
            }else if(e.which == 97 || 65){
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
                this._delete(len);
            }
            
            setTimeout(dojo.hitch(this, function(){
                dojo.disconnect(this._c);
                dojo.destroy(this._hidden);
                this.div.focus();
                this.getCharObj(true);
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
        if (e.which == 8)
			return false;
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
        dojo.byId('divHolder').scrollTop = this.after.offsetTop;
    };
    
    proto._renderLineNumbers = function(){
        if(this._prevLineCount == null)
            this._prevLineCount = 0;
        if(this._count(this.rows)!=this._prevLineCount){
            var div = dojo.byId('lineNumbers');
            div.innerHTML = '';
            for(var i=1; i<=this._count(this.rows); i++){
                div.innerHTML = div.innerHTML+'<span style="color:grey;">1</span><span class="line">'+i+'</span><br>';
            }
            this._prevLineCount = this._count(this.rows);
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
        var home = new ToggleButton({
            label: '<img style="width:18px;height:18;" src="images/home.png"/>',
            showLabel: true,
            id: 'homeButton'
        });
        toolbar.addChild(home);
        this.homeButton = home;
        dojo.connect(home, 'onclick', this, '_onHomeClick');
        dojo.attr(home.domNode, 'style', 'border-bottom:3px solid black');
        dojo.style('homeButton_label', 'padding', '0px');
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
        var sep = new Separator({});
        toolbar.addChild(sep);
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
        this._palette = new ColorPalette({style:'position:fixed;display:none;left:85px'},paletteNode);
        dojo.connect(this._palette, 'onChange', this, '_onForeColorChange');
        var bgPaletteNode = dojo.create('div',{style:'width:100%;'},toolbar.domNode,'after');
        this._bgPalette = new ColorPalette({style:'position:fixed;display:none;left:115px'},bgPaletteNode);
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
        var edit = dojo.create('img',{src:'images/pencil.png','class':'editIcon'},title,'after');
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
    
    proto._buildShareButton = function(){
        var button = new Button({
            'domNode':this.toolbar.domNode,
            'listenTo':this,
            'id':'shareButton',
            'displayButton':false});
        dojo.style(button.emailBox, 'position', 'absolute');
        dojo.style(button.emailBox, 'top', '49px');
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
                for(var i=start; i<end; i++){
                    if(this.value.string[i]['filters'] == undefined){
                        this.value.string[i]['filters'] = [];
                    }
                    if(dojo.indexOf(this.value.string[i]['filters'],'text-decoration:line-through;') == -1){
                        this.value.string[i]['filters'].push('text-decoration:line-through;'); 
                    }        
                }
                this.render();
                this._hold = true;
                this.collab.sendSync('editorStrikethrough', {'string':this.value.string}, null);
            }else if(this._hold == true && this._lastOp == 'strikethrough'){
                for(var i=start; i<end; i++){
                    if(this.value.string[i]['filters'] == undefined){
                        this.value.string[i]['filters'] = [];
                    }
                    if(dojo.indexOf(this.value.string[i]['filters'],'text-decoration:line-through;') == -1){
                        this.value.string[i]['filters'].push('text-decoration:line-through;'); 
                    }else{
                        this.value.string[i]['filters'][dojo.indexOf(this.value.string[i]['filters'],'text-decoration:line-through;')] = '';
                    }
                }
                this.render();
                this._hold = true;
                this.collab.sendSync('editorStrikethrough', {'string':this.value.string}, null);
            }
        }
        this._lastOp = 'strikethrough';
        this.div.focus();
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
            for(var i=start; i<end; i++){
                if(this.value.string[i]['filters'] == undefined){
                    this.value.string[i]['filters'] = [];
                }
                for(var j=0; j<this._pastForeColors.length; j++){
                    if(dojo.indexOf(this.value.string[i]['filters'],'color:'+this._pastForeColors[j]+';') != -1)
                        this.value.string[i]['filters'][dojo.indexOf(this.value.string[i]['filters'],'color:'+this._pastForeColors[j]+';')] = '';
                }
                this.value.string[i]['filters'].push('color:'+color+';'); 
            }
            this.render();
            this.collab.sendSync('editorForeColor', {'string':this.value.string}, null);
        }

        this._pastForeColors.push(color);
        this.div.focus();
        this._hidePalette();
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
            for(var i=start; i<end; i++){
                if(this.value.string[i]['filters'] == undefined){
                    this.value.string[i]['filters'] = [];
                }
                for(var j=0; j<this._pastHiliteColors.length; j++){
                    if(dojo.indexOf(this.value.string[i]['filters'],'background:'+this._pastHiliteColors[j]+';') != -1)
                        this.value.string[i]['filters'][dojo.indexOf(this.value.string[i]['filters'],'background:'+this._pastHiliteColors[j]+';')] = '';
                }
                this.value.string[i]['filters'].push('background:'+color+';'); 
            }
            this.render();
            this.collab.sendSync('editorHiliteColor', {'string':this.value.string}, null);
        }
        
        this._pastHiliteColors.push(color);
        this.div.focus();
        this._hidePalette();
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
    
    proto._onSliderClick = function(){
        dojo.publish("sliderToggle", [{}]);
    };
    
    proto._onRemoteTitle = function(obj){
        this.title = obj.value.title;
        this._title.innerHTML = this.title;
    };
    
    proto._resize = function(initial) {
        if(initial != true){
            this.render();
            this.getCharObj(true);
        }
        dojo.attr('thisDiv','style','background:white;cursor:text;z-index:1000;height:100%;min-height:100%;');
        dojo.attr('lineNumbers','style','width:auto;height:100%;background:grey;min-width:30px;');
        dojo.style(this._div, 'height', (window.innerHeight-70)+'px');
    };

    proto._onMouseDown = function(e){
        this._selStart = {x:e.clientX,y:e.clientY};
    };
    
    proto._onClick = function(e){
        //Clear selection
        this.clearSelection();
        this.render(true);
        
        var _prevStart = this.value.start;
        var _prevEnd = this.value.end;
        var ignore = ['selection', 'before', 'after'];
        var i=0; j = 0; k=0;
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
        
        //Backup if no matches: is Point in Line? Go to end if so...
        // var line = 0;
        //         if(start == null && end == null){
        //             dojo.query("#thisDiv span, br").forEach(dojo.hitch(this, function(node, index, arr){
        //                 if(dojo.indexOf(ignore,node.id) == -1){
        //                     k++;
        //                     if(node.tagName == 'SPAN'){
        //                         var pos = this._findPos(node);
        //                         var height = node.offsetHeight;
        //                         var points = {top: pos.top, bottom: pos.top+height};
        //                         if(this._isPiL(points, {y:e.clientY}) == true){
        //                            start = k;
        //                            end = k;
        //                         }
        //                     }
        //                 }
        //             }));
        //         }
        //         
        if(start && end){
            this.value.start = start-1;
            this.value.end = end-1;

            if(end != start)
                this.value.start = (start>0) ? start-1 : 0;

            this.render(true);
            this.getCharObj(true);
        }
    };
    
    proto._onFocus = function(e){
        this.displayCaret = true;
        if(dojo.byId('hidden'))
            dojo.destroy('hidden');
        dojo.publish("shareHide", [{}]);
    };
    
    proto._onBlur = function(){
        this.displayCaret = false;
    };
    
    return textarea;
});