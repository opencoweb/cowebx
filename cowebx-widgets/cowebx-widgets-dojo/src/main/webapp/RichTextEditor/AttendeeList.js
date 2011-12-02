define([
    'dojo',
    'dijit/registry',
    'coweb/main',
	'dijit/ColorPalette'
], function(dojo, dijit, coweb, ColorPalette) {
    var AttendeeList = function(args){
        if(!args.domNode || !args.id || !args._textarea)
            throw new Error("AttendeeList: missing arg");
        this.domNode 		= args.domNode;
        this.id 			= args.id;
        this._textarea	 	= args._textarea;
        this.attendees 		= {};
		this.site			= null;
		this._forecolor		= false;
        this.collab 		= coweb.initCollab({id : this.id});
        this.collab.subscribeSync('attendeeListJoin', this, 'onRemoteUserJoin');
        this.collab.subscribeSync('attendeeListName', this, 'onRemoteUserName');
		this.collab.subscribeSync('attendeeListColor', this, '_onRemoteColorChange');
		dojo.subscribe("hideAll", dojo.hitch(this, function(message){ this._hidePalette(); }));
    };
    var proto = AttendeeList.prototype;
    
    proto.onLocalUserJoin = function(users){
        for(var i=0; i<users.length; i++){
            if(this.attendees[users[i]['site']]==null && users[i]['local']==true){
				this.site = users[i]['site'];
                this.attendees[users[i]['site']] = {
                    color   :   '#'+Math.floor(Math.random()*16777215).toString(16),
                    name    :   users[i]['username']
                };
                this.createUserEntry(users[i]['username'],users[i]['site'],true);
                this.collab.sendSync('attendeeListJoin', {
                    'name':users[i]['username'],
                    'site':users[i]['site'],
                    'color':this.attendees[users[i]['site']]['color']
                }, null);
            }
        }
    };
    
    proto.onRemoteUserJoin = function(obj){
        this.attendees[obj.value.site] = {
            color   :   obj.value.color,
            name    :   obj.value.name
        };
        this.createUserEntry(obj.value.name,obj.value.site);
    };
    
    proto.onRemoteUserName = function(obj){
        var site = obj.value.site;
        this.attendees[site].name = obj.value.value;
        dojo.attr('user'+site,'innerHTML',obj.value.name);
        var color = dojo.create('div',{'class':'attendeeColor'},dojo.byId('user'+site),'first');
        dojo.style(color,'background',this.attendees[site]['color']);
    };
    
    proto.onUserLeave = function(users){
        for(var i=0; i<users.length; i++)
            this.destroyUserEntry(users[i]['site']);
    };
    
    proto.createUserEntry = function(name, site, local){
        var a = dojo.create('div',{id:'user'+site,'class':'attendee'},this.domNode, 'last');
        if(local){
            var b = dojo.create('input',{'class':'attendeeText',value:name,type:'text'},a);
            var color = dojo.create('div',{id:'localColor','class':'attendeeColor'},a,'first');
            dojo.style(color,'background',this.attendees[site]['color']);
			dojo.style('selection','borderLeft','2px solid '+this.attendees[site]['color']);
			this._textarea._selColor = this.attendees[site]['color'];
            dojo.addClass(a, 'localUser');
            dojo.create('img',{src:'../lib/cowebx/dojo/RichTextEditor/images/pencil.png','class':'userEditIcon'},b,'after');
            dojo.connect(b, 'onclick', this, function(e){ e.target.value = ''; });
            dojo.connect(b, 'onblur', this, function(e){
                if(e.target.value.length == 0){
                    e.target.value = this.attendees[site].name;
                }else{
                    this.attendees[site].name = e.target.value;
                    this.collab.sendSync('attendeeListName', {'name':e.target.value,'site':site}, null);
                }
            });
	        dojo.connect(b, 'onkeypress', this, function(e){
	            if(e.keyCode == 13)
	                e.target.blur();
	        });
			dojo.place(a, this.domNode, 'first');
			
			//color palette
			dojo.connect(color, 'onclick', this, '_onColorClick');
			var colorPaletteNode = dojo.create('div',{style:'width:100%;'},a,'after');
			this._colorPalette = new ColorPalette({'class':'nameColorPalette'},colorPaletteNode);
			dojo.connect(this._colorPalette, 'onChange', this, '_onColorChange');
        }else{
            dojo.attr(a, 'innerHTML', name);
            var color = dojo.create('div',{id:site+'Color','class':'attendeeColor'},a,'first');
            dojo.style(color,'background',this.attendees[site]['color']);
        }
    };
    
    proto.destroyUserEntry = function(site){
        dojo.destroy('user'+site);
        dojo.destroy('caret'+site);
        delete this.attendees[site];
        delete this._textarea.attendees[site];
    };

	proto._onColorClick = function(){
        if(this._forecolor == false){
            dojo.style(this._colorPalette.domNode, 'display', 'block');
            this._forecolor = true;
        }else if(this._forecolor){
            dojo.style(this._colorPalette.domNode, 'display', 'none');
            this._forecolor = false;
        }
	};
	
	proto._onColorChange = function(color){
		//1. change color of square / caret
		dojo.style('localColor','background',color);
		dojo.style('selection','borderLeft','2px solid '+color);
		this._textarea._selColor = color;
		
		//2. change color in memory
		this.attendees[this.site]['color'] = color;
		
		//3. send to everyone else
		this.collab.sendSync('attendeeListColor', {
			'site':this.site,
			'color':color
		}, null);
		
		this._hidePalette();
	};
	
	proto._onRemoteColorChange = function(obj){
		this.attendees[obj.value.site]['color'] = obj.value.color;
		this._textarea.attendees[obj.value.site]['color'] = obj.value.color;
		dojo.style(obj.value.site+'Color','background',obj.value.color);
		this._textarea._destroyRemoteCarets();
		this._textarea._renderRemoteCarets();
	};
	
	proto._hidePalette = function(){
		dojo.style(this._colorPalette.domNode, 'display', 'none');
		this._forecolor = false;
	};
    
    return AttendeeList;
});