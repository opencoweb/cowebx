define([
    'dojo',
    'dijit/registry',
    'coweb/main',
    'dijit/Toolbar',
    'dijit/form/ToggleButton',
    'dijit/ToolbarSeparator',
    'dijit/Dialog',
    'dijit/ColorPalette',
    './TimeSlider', 
    './ShareButton'
], function(dojo, dijit, coweb, Toolbar, ToggleButton, Separator, Dialog, ColorPalette, Slider, ShareButton) {
    var textarea = function(args){
        if(!args.domNode || !args.id || !args.parent)
            throw new Error("Textarea: missing arg");
        //1. Process args
        this.noSlider       =   (!args.noSlider) ? false : args.noSlider;
        this.domNode        =   args.domNode;
        this.id             =   args.id;
        this.parent         =   args.parent;

        //2. Build stuff
        this._buildTemplates();
        
        //3. Style and connect
        this._loadTemplate('../lib/cowebx/dojo/RichTextEditor/TextEditor.css');
        this._connect();
        this._onResize();
        
        //4. properties
        this.value              =   {start:0,end:0,string:[]};
        this.attendees          =   {};
        this.title              =   'Untitled Document';
        this.newSpace           =   '<span>&nbsp; </span>';
        this.prevValue          =   [];
        this.filters            =   [];
        this._pastForeColors    =   [];
        this._pastHiliteColors  =   [];
        this._lock              =   false;
		this._selColor			= 	'black';
        this.cancelKeys         =   {
            27 : 'esc',
            91 : 'meta',
            18 : 'option',
            17 : 'control',
            16 : 'shift'
        };
    };
    var proto = textarea.prototype;

    // Rips through all of this.value and blasts proper html equiv into dom
    proto.render = function(noRenderRemote) {
        var start = (this.value.start<this.value.end) ? this.value.start : this.value.end;
        var end = (this.value.end>=this.value.start) ? this.value.end : this.value.start;
        var a = []; var b = []; var c = [];
        var sel = 'background-color:#99CCFF;';

        var a = this.value.string.slice(0,this.value.start).join("");
        var b = this.value.string.slice(this.value.start,this.value.end).join("");
        var c = this.value.string.slice(this.value.end,this.value.string.length).join("");

        dojo.byId('thisFrame').innerHTML = a+'<span id="selection" style="border-left:2px solid '+this._selColor+';" class="selection">'+b+'</span>'+c;
        
        //Place remote carets in approriate positions
		if(!noRenderRemote)
        	this._renderRemoteCarets();
        
        //Render other stuff
        
        this._scrollWith();
    };
    
    // Insert single char at this.value.start & custom render
    proto.insert = function(c) {
        var start = (this.value.start<this.value.end) ? this.value.start : this.value.end;
        var end = (this.value.end>=this.value.start) ? this.value.end : this.value.start;
        var v = this.value;
        if(start != end)
            this.destroySelection();
        
        //1. Change string in memory
        v.string = v.string.slice(0,start).concat([c]).concat(v.string.slice(start,v.string.length));
        v.start = v.start+1;
        v.end = v.start;
        
        //Fix all remote carets
        var pos = start;
        for(var j in this.attendees){
            var s = this.attendees[j].start;
            if(pos < this.attendees[j].start)
                ++s;
            this.attendees[j].start = s;
            this.attendees[j].end = s;
        }
        
        //2. render
        this.insertRender(c);
        this._lock = false;  
    };
    
    // Remove n chars at this.value.start & custom render
    proto._delete = function(n) {
        if(this.value.string.length>0){
            var start = (this.value.start<this.value.end) ? this.value.start : this.value.end;
            var end = (this.value.end>=this.value.start) ? this.value.end : this.value.start;
            var v = this.value;
            var n = (!n) ? 1 : n;
            if(start != end){
                this.destroySelection();
            }else if(this.value.start>0){
                //1. Adjust string in memory
                var beforeLength = v.string.length+0;
                v.string = v.string.slice(0,v.start-n).concat(v.string.slice(v.start,v.string.length));
                var afterLength = v.string.length+0;
                if(beforeLength != afterLength){
                    v.start = v.start - n;
                    v.end = v.start;
                }
                
                //Fix all remote carets
                var pos = start;
                for(var j in this.attendees){
                    if(pos <= this.attendees[j].start)
                        --this.attendees[j].start;
                } 
                
                //2. custom render
                this.deleteRender();
            }
            this._lock = false; 
        }
    };

    // Clears current selection, sends caret to DIR ('left' or 'right') & custom render
    proto.clearSelection = function(dir, noRenderRemote) {
        var v = this.value;
        var start = (this.value.start<this.value.end) ? this.value.start : this.value.end;
        var end = (this.value.end>this.value.start) ? this.value.end : this.value.start;
        if(this.value.start != this.value.end){
            if(!dir || dir == 'left'){
                v.start = start;
                v.end = start;
            }else if(dir && dir == 'right'){
                v.start = end;
                v.end = end;
            }
            this.render(noRenderRemote);
        }
    };
    
    // Deletes current selection & custom render
    proto.destroySelection = function() {
        var v = this.value;
        var start = (this.value.start<this.value.end) ? this.value.start : this.value.end;
        var end = (this.value.end>this.value.start) ? this.value.end : this.value.start;
        this.value.end = start;
        v.string = v.string.slice(0,start).concat(v.string.slice(end,v.string.length));
        this.destroySelRender();
    };
    
    // Select all text & full render
    proto.selectAll = function() {
        var v = this.value;   
        if(!(v.end == 0 && v.start == v.string.length)){
            if(v.start != v.end)
                this.clearSelection();
            v.end=v.string.length;
            v.start=0;
            this.selectAllRender();
        }
    };
    
    // Get plain string representation of curr value
    proto.getValue = function() {
        return this.value.string;
    };
    
    // Move caret up one line & custom render
    proto.moveCaretUp = function(select) {
        //1. Populate obj rep'ing current line and lineAbove
        this._lineHeight = 18;
        var i=0;
        var top = Math.round(dojo.byId('selection').offsetTop-this._lineHeight);
        var lineAbove = {};
        var line = {};
        if((this.value.start != this.value.end) && !select)
            this.clearSelection();
        var nl = dojo.query('#thisFrame span, #thisFrame br').forEach(dojo.hitch(this, function(node, index, arr){
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
        
        //2. Get curr index into curr line
        if(!this._lock){
            for(var k in line){
                if(line[k]['node'].id=='selection')
                    this._lineIndex = k;
            }
            this._lock = true;    
        }
        
        //3. Custom render
        this.moveCaretUpRender(lineAbove, line, select, nl);        
    };
    
    // Move caret down one line & custom render
    proto.moveCaretDown = function(select) {
        //1. populate obj rep'ing curr line and lineBelow
        this._lineHeight = 18;
        var i=0;
        var top = Math.round(dojo.byId('selection').offsetTop+dojo.byId('selection').offsetHeight);
        var lineBelow = {};
        var line = {};
        if(this.value.start != this.value.end && !select)
            this.clearSelection();
        var nl = dojo.query('#thisFrame span, #thisFrame br').forEach(dojo.hitch(this, function(node, index, arr){
            if(node.offsetTop > top-5 && node.offsetTop < top+5 && node.tagName != 'BR'){
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
        
        //2. get curr index into curr line
        if(!this._lock){
            for(var k in line){
                if(line[k]['node'].id=='selection')
                    this._lineIndex = k;
            }
            this._lock = true;    
        }
        
        //3. Custom render
        this.moveCaretDownRender(lineBelow, line, select, nl);
    };
    
    // Move caret left one char & custom render
    proto.moveCaretLeft = function(select) {
        var start = (this.value.start<this.value.end) ? this.value.start : this.value.end;
        var end = (this.value.end>this.value.start) ? this.value.end : this.value.start;
        
        if(!select){
            this.clearSelection();
            if(start>0)
                start--;
            end = start;
        }else{
            if(start>0)
                start--;
        }
        this.value.start = start;
        this.value.end = end;
        this.moveLeftRender(select);
        this._lock = false;  
    };
    
    // Move caret right one char & custom render
    proto.moveCaretRight = function(select) {
        var start = (this.value.start<this.value.end) ? this.value.start : this.value.end;
        var end = (this.value.end>this.value.start) ? this.value.end : this.value.start;
        
        if(!select){
            this.clearSelection('right');
            if(end<this.value.string.length)
                end++;
            start = end;
        }else{
            if(end<this.value.string.length)
                end++;
        }
        this.value.start = start;
        this.value.end = end;
        this.moveRightRender(select);
        this._lock = false;  
    };
    
// Custom render functions

    proto.insertRender = function(c){
	    this._destroyRemoteCarets();
        var ch;
        if((c.search('">') != -1)||(c.search("nbsp") != -1)){
            ch = (c.search("nbsp") == -1) ? c.substring(c.search('">')+2,c.search('">')+3) : '&nbsp; ';
            var f = this.filters.join("");
            dojo.create('span',{innerHTML:ch,style:f},dojo.byId('selection'),'before');
        }else if(c.search('br') != -1){
            dojo.create('br',{},dojo.byId('selection'),'before');
        }
		this._renderRemoteCarets();
        this._scrollWith();
    };
    
    proto.deleteRender = function(){
		this._destroyRemoteCarets();
        dojo.destroy(dojo.byId('selection').previousSibling);
		this._renderRemoteCarets();
        this._scrollWith();
    };
    
    proto.destroySelRender = function(){
		this._destroyRemoteCarets();
        dojo.byId('selection').innerHTML = '';
        this._renderRemoteCarets();
        this._scrollWith();
    };
    
    proto.selectAllRender = function(){
		this._destroyRemoteCarets();
        dojo.destroy('selection');
        var f = dojo.byId('thisFrame');
        var temp = f.innerHTML+'';
        f.innerHTML = '';
        dojo.create('span',{style:'border-left:2px solid '+this._selColor,id:'selection',innerHTML:temp,'class':'selection'},f,'last');
		this._renderRemoteCarets();
        this._scrollWith();
    };
    
    proto.moveCaretUpRender = function(lineAbove, line, select, nl){
		this._destroyRemoteCarets();
        var count = this._count(lineAbove);
        var a = dojo.query('#selection span, #selection br');
        var s = dojo.byId('selection');
        var v = this.value;  
        if(count>0){
            if(count >= this._lineIndex){
                if(lineAbove[this._lineIndex]){
                    if(select){
                        var newSel = nl.slice( nl.indexOf(lineAbove[this._lineIndex].node) , nl.indexOf(s)).concat(a).place(s);
                        newSel.forEach(function(node, index, arr){ dojo.addClass(node,'trans'); });
                        v.start = lineAbove[this._lineIndex].index; 
                    }else{
                        v.start = lineAbove[this._lineIndex].index;
                        v.end = lineAbove[this._lineIndex].index;
                        dojo.place('selection', lineAbove[this._lineIndex].node, 'before');
                    }
                }else{
                    if(select){
                        var newSel = nl.slice( nl.indexOf(lineAbove[this._lineIndex-1].node)+1 , nl.indexOf(s)).concat(a).place(s);
                        newSel.forEach(function(node, index, arr){ dojo.addClass(node,'trans'); });
                        v.start = lineAbove[this._lineIndex-1].index+1;
                    }else{
                        v.start = lineAbove[this._lineIndex-1].index+1;
                        v.end = lineAbove[this._lineIndex-1].index+1;
                        dojo.place('selection', lineAbove[this._lineIndex-1].node, 'after');
                    }
                }
            }else if(count < this._lineIndex){
                if(select){
                    var newSel = nl.slice( nl.indexOf(lineAbove[count-1].node)+1, nl.indexOf(s)).concat(a).place(s);
                    newSel.forEach(function(node, index, arr){ dojo.addClass(node,'trans'); });
                    v.start = lineAbove[0].index+count;
                }else{
                    v.start = lineAbove[0].index+count;
                    v.end = lineAbove[0].index+count;
                    dojo.place('selection', lineAbove[count-1].node, 'after');
                }
            }
        }else{
            if(select){
                var newSel = nl.slice( nl.indexOf(line[0].node), nl.indexOf(s)).concat(a).place(s);
                newSel.forEach(function(node, index, arr){ dojo.addClass(node,'trans'); });
                v.start = line[0].index;
                this.moveCaretLeft(true);
            }else{
                if(line[0].node.previousSibling){
                    v.start = line[0].index-1;
                    v.end = line[0].index-1;
                    dojo.place('selection', line[0].node.previousSibling, 'before');   
                }
            }
        }
		this._renderRemoteCarets();
        this._scrollWith();
    };
    
    proto.moveCaretDownRender = function(lineBelow, line, select, nl){
		this._destroyRemoteCarets();
        var count = this._count(lineBelow);
        var s = dojo.byId('selection');
        var v = this.value;
        if(this._count(lineBelow)>0){
            if(count >= this._lineIndex){
                if(lineBelow[this._lineIndex]){
                    if(select){
                        var newSel = nl.slice(nl.indexOf(s)+1 , nl.indexOf(lineBelow[this._lineIndex].node)).place(s);
                        newSel.forEach(function(node){ dojo.addClass(node,'trans'); });
                        v.end = (lineBelow[this._lineIndex].index-1>v.string.length) ? v.string.length : lineBelow[this._lineIndex].index-1;
                    }else{
                        v.start = (lineBelow[this._lineIndex].index-1>v.string.length) ? v.string.length : lineBelow[this._lineIndex].index-1;
                        v.end = (lineBelow[this._lineIndex].index-1>v.string.length) ? v.string.length : lineBelow[this._lineIndex].index-1;
                        dojo.place('selection', lineBelow[this._lineIndex].node, 'before');
                    }
                }else{
                    if(select){
                        var newSel = nl.slice(nl.indexOf(s)+1 , nl.indexOf(lineBelow[this._lineIndex-1].node)+1).place(s);
                        newSel.forEach(function(node, index, arr){ dojo.addClass(node,'trans'); });
                        v.end = (lineBelow[this._lineIndex-1].index+1>v.string.length) ? v.string.length : lineBelow[this._lineIndex-1].index+1;
                    }else{
                        v.start = (lineBelow[this._lineIndex-1].index+1>v.string.length) ? v.string.length : lineBelow[this._lineIndex-1].index+1;
                        v.end = (lineBelow[this._lineIndex-1].index+1>v.string.length) ? v.string.length : lineBelow[this._lineIndex-1].index+1;
                        dojo.place('selection', lineBelow[this._lineIndex-1].node, 'after');
                    }
                }
            }else if(count < this._lineIndex){
                if(select){
                    var newSel = nl.slice(nl.indexOf(s)+1 , nl.indexOf(lineBelow[count-1].node)+1).place(s);
                    newSel.forEach(function(node, index, arr){ dojo.addClass(node,'trans'); });
                    v.end = (lineBelow[0].index+count-1>v.string.length) ? v.string.length : lineBelow[0].index+count-1;
                }else{
                    v.start = (lineBelow[0].index+count-1>v.string.length) ? v.string.length : lineBelow[0].index+count-1;
                    v.end = (lineBelow[0].index+count-1>v.string.length) ? v.string.length : lineBelow[0].index+count-1;
                    dojo.place('selection', lineBelow[count-1].node, 'after');
                }
            }
        }else{
            if(select){
                line = {};
                var anchor = s.nextSibling;
                i=0;
                if(anchor && anchor.tagName != 'BR'){
                    var nl = dojo.query('#thisFrame span, #thisFrame br').forEach(dojo.hitch(this, function(node, index, arr){
                        if(node.offsetTop == anchor.offsetTop){
                            line[this._count(line)] = {
                                node: node,
                                index: i
                            };
                        }
                        i++;
                    }));
                    var newSel = nl.slice(nl.indexOf(s)+1 , nl.indexOf(line[this._count(line)-1].node)+1).place(s);
                    newSel.forEach(function(node, index, arr){ dojo.addClass(node,'trans'); });
                    v.end = line[this._count(line)-1].index;
                }else{
                    this.moveCaretRight(true);
                }
            }else{
                if(line[this._count(line)-1].node.nextSibling){
                    v.start = line[this._count(line)-1].index+1;
                    v.end = line[this._count(line)-1].index+1;
                    dojo.place('selection', line[this._count(line)-1].node.nextSibling, 'after');   
                }
            }
        }
		this._renderRemoteCarets();
        this._scrollWith();
    };
    
    proto.moveLeftRender = function(select){
		this._destroyRemoteCarets();
        var s = dojo.byId('selection');
        if(!select && s.previousSibling){
            dojo.place(s.previousSibling, s, 'after');
        }else if(s.previousSibling){
            dojo.addClass(s.previousSibling, 'trans'); 
            dojo.place(s.previousSibling, s, 'first');
        }
		this._renderRemoteCarets();
        this._scrollWith();
    };
    
    proto.moveRightRender = function(select){
		this._destroyRemoteCarets();
        var s = dojo.byId('selection');
        if(!select && s.nextSibling){
            dojo.place(s.nextSibling, s, 'before');
        }else if(s.nextSibling){ 
            dojo.addClass(s.nextSibling, 'trans');
            dojo.place(s.nextSibling, s, 'last');
        }
		this._renderRemoteCarets();
        this._scrollWith();
    };
    
    proto.onClickRender = function(endNode){
		this._destroyRemoteCarets();
        dojo.destroy('selection');
        dojo.create('span',{style:'border-left:2px solid '+this._selColor,id:'selection','class':'selection'},endNode,'after');
		this._renderRemoteCarets();
    };
    
    proto.onDragRender = function(startNode, nl){
		this._destroyRemoteCarets();
        dojo.destroy('selection');
        var a = dojo.create('span',{style:'border-left:2px solid '+this._selColor,id:'selection','class':'selection'},startNode,'before');
        nl.place(dojo.byId('selection'));
		this._renderRemoteCarets();
    };
    
// Utility functions
    
	proto._destroyRemoteCarets = function(){
		var nl = dojo.query('.remoteSelection').forEach(function(node){
			dojo.destroy(node);
		});
	};

	proto._renderRemoteCarets = function(){
		var nl = dojo.query("#thisDiv span,#thisDiv br");
        var nlFixed = nl.slice(0, nl.indexOf(dojo.byId('selection'))).concat(nl.slice(nl.indexOf(dojo.byId('selection'))+1,nl.length));
        var rc;
        for(var x in this.attendees){
	        if(this.attendees[x]['start']<this.value.start){
	            rc = dojo.create('div',{id:'caret'+x,'class':'remoteSelection',style:'border-color:'+this.attendees[x]['color']},nlFixed[this.attendees[x]['start']],'before');
	        }else if(this.attendees[x]['start']>this.value.end){
	            rc = dojo.create('div',{id:'caret'+x,'class':'remoteSelection',style:'border-color:'+this.attendees[x]['color']},nlFixed[this.attendees[x]['start']-1],'after');
	        }else if(this.attendees[x]['start']==this.value.start){
	            rc = dojo.create('div',{id:'caret'+x,'class':'remoteSelection',style:'border-color:'+this.attendees[x]['color']},nlFixed[this.attendees[x]['start']-1],'after');
	        }else if(this.attendees[x]['start']==this.value.end){
	            rc = dojo.create('div',{id:'caret'+x,'class':'remoteSelection',style:'border-color:'+this.attendees[x]['color']},nlFixed[this.attendees[x]['start']],'before');
	        }else if(this.attendees[x]['start']<this.value.end && this.attendees[x]['start']>this.value.start){
	            rc = dojo.create('div',{id:'caret'+x,'class':'remoteSelection',style:'border-color:'+this.attendees[x]['color']},nlFixed[this.attendees[x]['start']],'before');
	        }   
		}
	};

    proto._moveToEmptyLine = function(clickHt) {
        // var diff = 100000;
        //         var diff2 = 100000;
        //         var to = null;
        //         var from = null;
        //         dojo.query('#lineNumbers span').forEach(dojo.hitch(this, function(node, index, arr){
        //             if(node.innerHTML == 1 && dojo.attr(node, 'num')){
        //                 if(Math.abs(clickHt - (this._findPos(node).top-dojo.byId('divHolder').scrollTop)) < diff){
        //                     diff = Math.abs(clickHt - (this._findPos(node).top-dojo.byId('divHolder').scrollTop));
        //                     to = parseInt(dojo.attr(node, 'num'));
        //                 }
        //                 if(Math.abs(this._findPos(node).top - this._findPos(dojo.byId('selection')).top) < diff2){
        //                     diff2 = Math.abs(this._findPos(node).top - this._findPos(dojo.byId('selection')).top);
        //                     from = parseInt(dojo.attr(node, 'num'));
        //                 }
        //             }
        //         }));
        //         this._lock = true;
        //         this._lineIndex = 10000;
        // 
        //         if(from <= to){
        //             for(var i=0; i<to-from; i++)
        //                 this.moveCaretDown();
        //         }else{
        //             for(var i=0; i<from-to; i++)
        //                 this.moveCaretUp();
        //         }
    };
    
    proto._scrollWith = function(){
        
    };
    
    proto._listenForKeyCombo = function(e) {
        //Current limitations: only works with COMMAND / CTRL + key
        //1. Listen for command / ctrl cross-browser
        if((e.which == 224) || (e.which == 91) || (e.which == 17)){
            
            //2. Put current selection in hidden div, change focus
            var sel = this._stripTags(this._stripSpaces(this._replaceBR(dojo.byId('selection').innerHTML)));
            this._hidden = dojo.create('textarea',{
                id:'hidden',
                style:'position:fixed;left:-10000px;top:100px;height:1px;width:1px;overflow:hidden;',
                innerHTML: sel
            },dojo.byId('tContainer'),'before');

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
    
    proto._chromeKeyCombo = function() {
        this._c = dojo.connect(this._hidden, 'onkeydown', this,function(e){
            //Paste
            if(e.which == 86){
                this.t = setTimeout(dojo.hitch(this, function(){
                    var text = this._hidden.value;
                    for(var i=0; i<text.length-1; i++){
                        if(text[i]==' '){
                            this.insert(this.newSpace, true);
                        }else if(text[i]=='^'){
                            this.insert('<br>',true);
                        }else{
                            this.insert('<span style="">'+text[i]+'</span>',true);
                        }
                    }
                    if(text[text.length-1]==' '){
                        this.insert(this.newSpace);
                    }else if(text[text.length-1]=='^'){
                        this.insert('<br>');
                    }else{
                        this.insert('<span style="">'+text[text.length-1]+'</span>');
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
                this._delete();
            }
            
            setTimeout(dojo.hitch(this, function(){
                dojo.disconnect(this._c);
                dojo.destroy(this._hidden);
                dojo.byId('thisDiv').focus();
            }), 100);
            
        });  
    };
    
    proto._universalKeyCombo = function() {
        this._c = dojo.connect(this._hidden, 'onkeypress', this,function(e){
            //Paste
            if(e.which == 118){
                this.t = setTimeout(dojo.hitch(this, function(){
                    var text = this._hidden.value;
                    for(var i=0; i<text.length-1; i++){
                        if(text[i]==' '){
                            this.insert(this.newSpace, true);
                        }else if(text[i]=='^'){
                            this.insert('<br>',true);
                        }else{
                            this.insert('<span style="">'+text[i]+'</span>',true);
                        }
                    }
                    if(text[text.length-1]==' '){
                        this.insert(this.newSpace);
                    }else if(text[text.length-1]=='^'){
                        this.insert('<br>');
                    }else{
                        this.insert('<span style="">'+text[text.length-1]+'</span>');
                    }
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
			var prevScrollTop = dojo.byId('divHolder').scrollTop;
            setTimeout(dojo.hitch(this, function(){
                dojo.disconnect(this._c);
                dojo.destroy(this._hidden);
                dojo.byId('thisDiv').focus();
				dojo.byId('divHolder').scrollTop = prevScrollTop;
            }), 100);
        });
        
    };
    
    proto._loadTemplate = function(url) {
       var e = document.createElement("link");
       e.href = url;
       e.type = "text/css";
       e.rel = "stylesheet";
       e.media = "screen";
       document.getElementsByTagName("head")[0].appendChild(e);
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
    
    proto._hidePalette = function(){
		dojo.style(this._palette.domNode, 'display', 'none');
		dojo.style(this._bgPalette.domNode, 'display', 'none');
		this._hilitecolor = false;
		this._forecolor = false;
	};     
	
	proto._selectElementContents = function(el){
        var range = document.createRange();
        range.selectNodeContents(el);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    },
	
//Toolbar click events

    proto._onNewPageClick = function() {
        dijit.byId('tDialog').set('content', "You may lose data if you are the only user in the current session. Do you really want to start a new Document?");
        dijit.byId('tDialog').show();
        var one = dojo.connect(dijit.byId('yesButton'),'onClick',this, function(){
            window.location = window.location.pathname+'?'+'session='+Math.floor(Math.random()*10000001);
            dojo.disconnect(one);
            dojo.disconnect(two);
        });
        var two = dojo.connect(dijit.byId('noButton'),'onClick',this, function(){
            dijit.byId('tDialog').hide();
            dojo.disconnect(one);
            dojo.disconnect(two);
        });
        var three = dojo.connect(dijit.byId('tDialog'), 'onHide', this, function(){
            dojo.disconnect(one);
            dojo.disconnect(two);
            dojo.disconnect(three);
        });
    };
    
    proto._onSaveClick = function() {
         dojo.publish("shareClick", [{}]);
    };
    
    proto._onHomeClick = function() {
        dijit.byId('tDialog').set('content', "You may lose data if you are the only user in the current session. Do you really want to go to Home?");
        dijit.byId('tDialog').show();
        var one = dojo.connect(dijit.byId('yesButton'),'onClick',this, function(){
            window.location = window.location.pathname;
        });
        var two = dojo.connect(dijit.byId('noButton'),'onClick',this, function(){
            dijit.byId('tDialog').hide();
            dojo.disconnect(one);
            dojo.disconnect(two);
        });
        var three = dojo.connect(dijit.byId('tDialog'), 'onHide', this, function(){
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
        this._title.value = this.title;
    };
    
//Style events
    
    proto._onBoldClick = function() {
        if(this._bold == undefined)
            this._bold = false;
        if(this._lastOp != 'bold')
            this._hold = false;
        var start = (this.value.start<this.value.end) ? this.value.start : this.value.end;
        var end = (this.value.end>=this.value.start) ? this.value.end : this.value.start;
        if(start == end){
            if(this._bold == false){
                this._bold = true;
                this.filters.push('font-weight: bold;');
                dojo.attr(this.Bold.domNode, 'style', 'border-bottom:3px solid red');
            }else{
                this._bold = false;
                this.filters[dojo.indexOf(this.filters,'font-weight: bold;')] = '';
                dojo.attr(this.Bold.domNode, 'style', 'border-bottom:3px solid black');
            }
        }else{
            if(this._hold == false){
                for(var i=start; i<end; i++){
                    if(this.value.string[i].search("font-weight: bold;") == -1){
                        var index = this.value.string[i].search('">');
                        if(index != -1)
                            this.value.string[i] = this.value.string[i].substring(0,index)+'font-weight: bold;'+this.value.string[i].substring(index, this.value.string[i].length);
                    }
                }
                this._hold = true;
            }else if(this._hold == true && this._lastOp == 'bold'){
                var x=0;
                for(var i=start; i<end; i++){
                    if(this.value.string[i].search("font-weight: bold;") != -1){
                        var index = this.value.string[i].search('font-weight: bold;');
                        if(index != -1)
                            this.value.string[i] = this.value.string[i].substring(0,index)+this.value.string[i].substring(index+18, this.value.string[i].length);
                    }
                }
                this._hold = false;
            }
            this.collab.sendSync('editorStyle', {'string':this.value.string}, null);
        }
        this._lastOp = 'bold';
        dojo.byId('thisDiv').focus();
        this.render();
    };
    
    proto._onItalicClick = function() {
        if(this._italic == undefined)
            this._italic = false;
        if(this._lastOp != 'italic')
            this._hold = false;
        var start = (this.value.start<this.value.end) ? this.value.start : this.value.end;
        var end = (this.value.end>=this.value.start) ? this.value.end : this.value.start;
        if(start == end){
            if(this._italic == false){
                this._italic = true;
                this.filters.push('font-style: italic;');
                dojo.attr(this.Italic.domNode, 'style', 'border-bottom:3px solid red');
            }else{
                this._italic = false;
                this.filters[dojo.indexOf(this.filters,'font-style: italic;')] = '';
                dojo.attr(this.Italic.domNode, 'style', 'border-bottom:3px solid black');
            }
        }else{
            if(this._hold == false){
                for(var i=start; i<end; i++){
                    if(this.value.string[i].search("font-style: italic;") == -1){
                        var index = this.value.string[i].search('">');
                        if(index != -1)
                            this.value.string[i] = this.value.string[i].substring(0,index)+'font-style: italic;'+this.value.string[i].substring(index, this.value.string[i].length);
                    }
                }
                this._hold = true;
            }else if(this._hold == true && this._lastOp == 'italic'){
                var x=0;
                for(var i=start; i<end; i++){
                    if(this.value.string[i].search("font-style: italic;") != -1){
                        var index = this.value.string[i].search('font-style: italic;');
                        if(index != -1)
                            this.value.string[i] = this.value.string[i].substring(0,index)+this.value.string[i].substring(index+19, this.value.string[i].length);
                    }
                }
                this._hold = false;
            }
            this.collab.sendSync('editorStyle', {'string':this.value.string}, null);
        }
        this._lastOp = 'italic';
        dojo.byId('thisDiv').focus();
        this.render();
    };
    
    proto._onUnderlineClick = function() {
        if(this._underline == undefined)
            this._underline = false;
        if(this._lastOp != 'underline')
            this._hold = false;
        var start = (this.value.start<this.value.end) ? this.value.start : this.value.end;
        var end = (this.value.end>=this.value.start) ? this.value.end : this.value.start;
        if(start == end){
            if(this._underline == false){
                this._underline = true;
                this.filters.push('text-decoration: underline;');
                dojo.attr(this.Underline.domNode, 'style', 'border-bottom:3px solid red');
            }else{
                this._underline = false;
                this.filters[dojo.indexOf(this.filters,'text-decoration: underline;')] = '';
                dojo.attr(this.Underline.domNode, 'style', 'border-bottom:3px solid black');
            }
        }else{
            if(this._hold == false){
                for(var i=start; i<end; i++){
                    if(this.value.string[i].search("text-decoration: underline;") == -1){
                        var index = this.value.string[i].search('">');
                        if(index != -1)
                            this.value.string[i] = this.value.string[i].substring(0,index)+'text-decoration: underline;'+this.value.string[i].substring(index, this.value.string[i].length);
                    }
                }
                this._hold = true;
            }else if(this._hold == true && this._lastOp == 'underline'){
                var x=0;
                for(var i=start; i<end; i++){
                    if(this.value.string[i].search("text-decoration: underline;") != -1){
                        var index = this.value.string[i].search('text-decoration: underline;');
                        if(index != -1)
                            this.value.string[i] = this.value.string[i].substring(0,index)+this.value.string[i].substring(index+27, this.value.string[i].length);
                    }
                }
                this._hold = false;
            }
            this.collab.sendSync('editorStyle', {'string':this.value.string}, null);
        }
        this._lastOp = 'underline';
        dojo.byId('thisDiv').focus();
        this.render();
    };
    
    proto._onForeColorClick = function() {
        if(this._forecolor == undefined)
            this._forecolor = false;
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
            if((this._prevForeColor == null || undefined) || (dojo.indexOf(this.filters,'color: '+this._prevForeColor+';') == -1)){
                
            }else if(this._prevForeColor){
                this.filters[dojo.indexOf(this.filters,'color: '+this._prevForeColor+';')] = '';
            }
            this.filters.push('color: '+color+';');
            this._prevForeColor = color;
            dojo.attr(this.ForeColor.domNode, 'style', 'border-bottom:3px solid '+color);
        }else{
            for(var i=start; i<end; i++){
                for(var j=0; j<this._pastForeColors.length; j++){
                    if(this.value.string[i].search("color: "+this._pastForeColors[j]+";") != -1){
                        var index = this.value.string[i].search("color: "+this._pastForeColors[j]+";");
                        if(index != -1)
                            this.value.string[i] = this.value.string[i].substring(0,index)+this.value.string[i].substring(index+8+this._pastForeColors[j].length, this.value.string[i].length);
                    }
                }
                var index = this.value.string[i].search('">');
                if(index != -1)
                    this.value.string[i] = this.value.string[i].substring(0,index)+'color: '+color+';'+this.value.string[i].substring(index, this.value.string[i].length);
            }
            this.collab.sendSync('editorStyle', {'string':this.value.string}, null);
        }

        this._pastForeColors.push(color);
        dojo.byId('thisDiv').focus();
        this._hidePalette();
        this.render();
    };
    
    proto._onHiliteColorClick = function() {
        if(this._hilitecolor == undefined)
            this._hilitecolor = false;
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
            if((this._prevHiliteColor == null || undefined) || (dojo.indexOf(this.filters,'background: '+this._prevHiliteColor+';') == -1)){
                
            }else if(this._prevHiliteColor){
                this.filters[dojo.indexOf(this.filters,'background: '+this._prevHiliteColor+';')] = '';
            }
            this.filters.push('background: '+color+';');
            this._prevHiliteColor = color;
            dojo.attr(this.HiliteColor.domNode, 'style', 'border-bottom:3px solid '+color);
        }else{
            for(var i=start; i<end; i++){
                for(var j=0; j<this._pastHiliteColors.length; j++){
                    if(this.value.string[i].search("background: "+this._pastHiliteColors[j]+";") != -1){
                        var index = this.value.string[i].search("background: "+this._pastHiliteColors[j]+";");
                        if(index != -1)
                            this.value.string[i] = this.value.string[i].substring(0,index)+this.value.string[i].substring(index+13+this._pastHiliteColors[j].length, this.value.string[i].length);
                    }
                }
                var index = this.value.string[i].search('">');
                if(index != -1)
                    this.value.string[i] = this.value.string[i].substring(0,index)+'background: '+color+';'+this.value.string[i].substring(index, this.value.string[i].length);
            }
            this.collab.sendSync('editorStyle', {'string':this.value.string}, null);
        }

        this._pastHiliteColors.push(color);
        dojo.byId('thisDiv').focus();
        this._hidePalette();
        this.render();
    };
    
    proto._onRemoteStyle = function(obj) {
        this.value.string = obj.value.string
        this.render();
    };
    
//Generic events
    
    proto._onKeyPress = function(e) {
        e.preventDefault();
        if(e.charCode == 0){
            switch(e.keyCode){
                case 9: //TAB
                    for(var i=0; i<4; i++)
                        this.insert(this.newSpace);
                    break;
                case 8: //BACKSPACE
                    this._delete(1);
                    break;
                case 13: //NEWLINE
                    if(this.value.string[this.value.start-1] && this.value.string[this.value.start-1] == this.newSpace)
                        this._delete(1);
                    setTimeout(dojo.hitch(this, function(){this.insert('<br>');}), 100);
                    break;
                case 35: //END
                    this.moveCaretToEnd();
                    break;
                case 36: //HOME
                    this.moveCaretToStart();
                    break;
                case 37: //LEFT
                    this.moveCaretLeft(e.shiftKey);
                    break;
                case 38: //UP
                    this.moveCaretUp(e.shiftKey);
                    break;
                case 39: //RIGHT
                    this.moveCaretRight(e.shiftKey);
                    break;
                case 40: //DOWN
                    this.moveCaretDown(e.shiftKey);
                    break;
            }
        }else{
            //INSERT CHAR
            if(this.cancelKeys[e.keyCode] != undefined){ }else{
                switch(e.charCode){
                    case 32:
                        this.insert(this.newSpace);
                        break;
                    default:
                        var f = this.filters.join("");
                        this.insert('<span style="'+f+'">'+String.fromCharCode(e.which)+'</span>');
                }
            }
        }
    };

    proto._onMouseDown = function(e){
        this.clearSelection();
    };
    
    proto._onclick = function(e){
        var sel = window.getSelection();
        //If dragging to select
        if(sel.toString().length > 0 && dojo.byId('thisFrame').childNodes.length>1){
            var range = sel.getRangeAt(0);
            //1. Get start and end node for for click+drag
            var start = (range.startOffset == 0) ? range.startContainer.parentNode : range.startContainer.parentNode.nextSibling;
            var end = (range.endOffset == 0) ? range.endContainer.parentNode : range.endContainer.parentNode.nextSibling;
            if(start.id == 'selection')
                start = start.nextSibling;
            if(end && end.id == 'selection')
                end = end.nextSibling;
            //2. Place selection before start
            dojo.place('selection',start,'before');
            //3. Query all nodes in doc, remove selection
            var nl = dojo.query("#thisDiv span,#thisDiv br");
            var nlFixed = nl.slice(0, nl.indexOf(dojo.byId('selection'))).concat(nl.slice(nl.indexOf(dojo.byId('selection'))+1,nl.length));
            //4. Set this.value.start & this.value.end to proper values
            this.value.start = nlFixed.indexOf(start);
            this.value.end = (end == null) ? nlFixed.length : nlFixed.indexOf(end);
            window.getSelection().removeAllRanges();
            this.onDragRender(start, nlFixed.slice(this.value.start, this.value.end));
        //If clicking
        }else{
            var endNode = e.target;
            var j=0;
            var end = null;
            var nl = dojo.query("#thisDiv span,#thisDiv br");
            var nlFixed = nl.slice(0, nl.indexOf(dojo.byId('selection'))).concat(nl.slice(nl.indexOf(dojo.byId('selection'))+1,nl.length));
            nlFixed.forEach(dojo.hitch(this, function(node, index, arr){
                j++;
                if(endNode == node)
                    end = j;
            }));
            if(end == null){
                this._onFocus();
                this._moveToEmptyLine(e.clientY);
            }else{
                this.value.start = end;
                this.value.end = end;
                this.onClickRender(endNode);
            }
        }
    };
    
    proto._onFocus = function(e){
        if(dojo.byId('hidden'))
            dojo.destroy('hidden');
        dojo.publish("hideAll", [{}]);
    };
    
    proto._onBlur = function(){

    };
    
    proto._onResize = function() {
        //Style on resize as a late hook, fix eventually
        dojo.style(this._div, 'height', (window.innerHeight-70)+'px');    
    };
    
    proto._connect = function(){
        dojo.connect(window, 'resize', this, '_onResize');
        dojo.connect(dojo.byId('thisDiv'), 'onmousedown', this, '_onMouseDown');
        dojo.connect(dojo.byId('thisDiv'), 'onmouseup', this, '_onclick');
        dojo.connect(dojo.byId('thisDiv'), 'onfocus', this, '_onFocus');
        dojo.connect(dojo.byId('thisDiv'), 'onblur', this, '_onBlur');
        dojo.connect(dojo.byId('thisDiv'), 'onkeypress', this, '_onKeyPress');
        dojo.connect(dojo.byId('thisDiv'), 'onkeydown', this, '_listenForKeyCombo');   
        dojo.connect(dojo.byId('url'),'onclick',this,function(e){ this._selectElementContents(e.target) });   
        dojo.subscribe("hideAll", dojo.hitch(this, function(message){ this._hidePalette(); }));        
        this.collab = coweb.initCollab({id : this.id});
        this.collab.subscribeSync('editorStyle', this, '_onRemoteStyle');
        this.collab.subscribeSync('editorTitle', this, '_onRemoteTitle');
    };
    
//Build functions
    
    proto._buildTemplates = function(){
        //1. Outer table
        var outerTable = dojo.create('table',{'class':'outerTable'},this.domNode);
        var outerRow = dojo.create('tr',{'style':'width:100%;height:100%;'},outerTable);
        var cell1 = dojo.create('td',{'style':'height:100%;'},outerRow,'first');
        var cell2 = dojo.create('td',{'style':'width:200px;height:100%;',id:'attendeeListContainer','class':'attendeeListContainer'},outerRow,'last');
        dojo.create('div',{'style':'height:100%;min-width:800px;position:relative',id:'tContainer'},cell1);
        //2. Table
        this._div = dojo.create('div', {'style':'width:100%;height:100%;overflow-y:auto;',id:'divHolder'}, dojo.byId('tContainer'));
        var rulerContainer = dojo.create('div',{'class':'rulerContainer',id:'rulerContainer'},'tContainer','first');
        var i = dojo.create('img', {src:'../lib/cowebx/dojo/RichTextEditor/images/ruler.png', 'class':'ruler'}, rulerContainer, 'first');
        var d = dojo.create('div', {tabindex:-1,id:'thisDiv','class':'div'}, this._div, 'last');
        dojo.create('div',{id:'thisFrame'},dojo.byId('thisDiv'),'first');
        //3. Toolbar, footer, & confirm dialog
        this._buildToolbar();
        this._buildFooter();
        this._buildConfirmDialog();
        //4. Slider & ShareButton
        var node = dojo.create('div',{'class':'slider',id:'sliderHolder'},dijit.byId('tToolbar').domNode,'after');
        var holder = dojo.create('div',{'style':'width:100%;height:100%'},node);
        this.slider = new Slider({'domNode':holder,textarea:this,'id':'slider','parent':this.parent});
        var button = new ShareButton({
            'domNode':dijit.byId('tToolbar').domNode,
            'listenTo':this.parent,
            'id':'shareButton',
            'displayButton':false});
        //5. Caret
        dojo.create('span',{style:'border-left:2px solid black',id:'selection','class':'selection'},dojo.byId('thisFrame'),'last');         
        //6. Build infoDiv
        var template = '<div id="infoDiv">'
			+'<div class="collabTitle">Collaborate</div>'
			+'<div id="url"></div>'
			+'<div class="collabSubTitle">Copy url to friends to collaborate</div>';
	    dojo.byId('attendeeListContainer').innerHTML =  dojo.byId('attendeeListContainer').innerHTML+template;   
	    dojo.byId('url').innerHTML = window.location;
    };
    
    proto._buildToolbar = function(){
        var toolbarNode = dojo.create('div',{style:'width:100%;height:50px;'},dojo.byId('tContainer'),'first');
        var toolbar = new Toolbar({id:'tToolbar'},toolbarNode);
        dojo.attr(toolbar.domNode, 'class', 'gradient header');
        
        //1. Home button
        var home = new ToggleButton({
            label: '<img style="width:18px;height:18;" src="../lib/cowebx/dojo/RichTextEditor/images/home.png"/>',
            showLabel: true,
            id: 'homeButton'
        });
        toolbar.addChild(home);
        this.homeButton = home;
        dojo.connect(home, 'onClick', this, '_onHomeClick');
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
            dojo.connect(button, 'onClick', this, '_on'+label+'Click');
            dojo.attr(this[label].domNode, 'style', 'border-bottom:3px solid black');
        }));
        var sep = new Separator({});
        toolbar.addChild(sep);
        
        //3. Bold, italic, underline, strikethrough
        dojo.forEach(["Bold", "Italic", "Underline"], dojo.hitch(this, function(label) {
            var button = new ToggleButton({
                label: label,
                showLabel: false,
                iconClass: "dijitEditorIcon dijitEditorIcon" + label
            });
            this[label] = button;
            toolbar.addChild(button);
            dojo.connect(button, 'onClick', this, '_on'+label+'Click');
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
            dojo.connect(button, 'onClick', this, '_on'+label+'Click');
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
            dojo.connect(button, 'onClick', this, '_onSliderClick');
            dojo.attr(button.domNode, 'style', 'border-bottom:3px solid black');
            dojo.style(button.domNode, 'float', 'right');
        }
        
        //Color pallettes
        var paletteNode = dojo.create('div',{style:'width:100%;'},toolbar.domNode,'after');
        this._palette = new ColorPalette({style:'position:fixed;display:none;left:225px;z-index:1000;'},paletteNode);
        dojo.connect(this._palette, 'onChange', this, '_onForeColorChange');
        var bgPaletteNode = dojo.create('div',{style:'width:100%;'},toolbar.domNode,'after');
        this._bgPalette = new ColorPalette({style:'position:fixed;display:none;left:260px;z-index:1000;'},bgPaletteNode);
        dojo.connect(this._bgPalette, 'onChange', this, '_onHiliteColorChange');
    };
    
    proto._buildFooter = function(){
        var footerNode = dojo.create('div',{'class':'footer gradient'},dojo.byId('tContainer'),'last');
        
        //1. Title box & image
        var title = dojo.create('input',{'class':'title',value:'Untitled Document',type:'text'},footerNode,'first');
        var edit = dojo.create('img',{src:'../lib/cowebx/dojo/RichTextEditor/images/pencil.png','class':'editIcon'},title,'after');
        
        //2. Connect
        dojo.connect(title, 'onclick', this, function(e){
            dojo.style(e.target, 'background', 'white');
            e.target.value = '';
        });
        dojo.connect(title, 'onblur', this, function(e){
            this.title = (e.target.value.length > 0) ? e.target.value : this.title;
            e.target.value = this.title;
            dojo.style(e.target, 'background', '');
            this.collab.sendSync('editorTitle', {'title':e.target.value}, null);   
        });
        dojo.connect(title, 'onkeypress', this, function(e){
            if(e.keyCode == 13)
                e.target.blur();
        });
        this._title = title;
        
        return footerNode;
    };
    
    proto._buildConfirmDialog = function(){
        secondDlg = new Dialog({
            title: "Are you sure?",
            style: "width: 300px;font:12px arial;",
            id: 'tDialog'
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
    
    return textarea;
});