define([
    'dojo',
    'dijit/registry',
    'coweb/main'
], function(dojo, dijit, coweb) {
    var AttendeeList = function(args){
        if(!args.domNode || !args.id)
            throw new Error("AttendeeList: missing arg");
        this.domNode = args.domNode;
        this.id = args.id;
        
        this.attendees = {};
        this.collab = coweb.initCollab({id : this.id});
        this.collab.subscribeSync('attendeeListJoin', this, 'onRemoteUserJoin');
    };
    var proto = AttendeeList.prototype;
    
    proto.onLocalUserJoin = function(users){
        for(var i=0; i<users.length; i++){
            if(this.attendees[users[i]['site']]==null && users[i]['local']==true){
                this.attendees[users[i]['site']] = {
                    color   :   '#'+Math.floor(Math.random()*16777215).toString(16),
                    name    :   users[i]['username']
                };
                this.createUserEntry(users[i]['username'],users[i]['site']);
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
        dojo.create('div',{id:'caret'+obj.value.site,'class':'remoteSelection'},dojo.byId('thisFrame'),'first');
    };
    
    proto.onUserLeave = function(users){
        for(var i=0; i<users.length; i++)
            this.destroyUserEntry(users[i]['site']);
    };
    
    proto.createUserEntry = function(name, site){
        var a = dojo.create('div',{id:'user'+site,'class':'attendee',innerHTML:name},this.domNode);
        var color = dojo.create('div',{'class':'attendeeColor'},a,'first');
        dojo.style(color,'background',this.attendees[site]['color']);
    };
    
    proto.destroyUserEntry = function(site){
        dojo.destroy('user'+site);
        dojo.destroy('caret'+site);
        delete this.attendees[site];
    };
    
    return AttendeeList;
});