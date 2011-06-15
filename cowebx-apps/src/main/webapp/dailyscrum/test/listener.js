//
// Mock listener interface to test Coweb Editor
//
// Copyright (c) The Dojo Foundation 2011. All Rights Reserved.
//
/*global define*/
define([
    'org/OpenAjax'
], function(OpenAjax) {    
    var listener = function(args) {
        this.collab = args.collab;
        this.engine = args.engine;
        this.local = args.local;
        
        this._paused = false;
        this._incomingPausedBuffer = [];
        this._lastOp = null;
        
        this.collab.pauseSync = dojo.hitch(this, '_pause');
        this.collab.resumeSync = dojo.hitch(this, '_resume');
        OpenAjax.hub.subscribe('coweb.sync.editorUpdate.'+this.local, '_syncOutbound', this);
    };
    var proto = listener.prototype;

    proto._syncOutbound = function(topic, event) {
        var op = this.engine.local('editorUpdate', event.value, event.type, event.position);
        this.engine.send(op);
        this._lastOp = op;
    };
    
    proto._pause = function() {
        if(!this._paused) {
            this._paused = true;
            this._incomingPausedBuffer = [];
        }
    };

    proto._resume = function() {
        var ops = this.engine.recvAll();
        console.log("resume "+this.local);
        console.log('ops = ',ops);
        for(var i=0; i<ops.length; i++){
            var params = {value: ops[i].value, type: ops[i].type, position: ops[i].position}
            var topic = ops[i].key;
            var topic = 'coweb.sync.'+topic+"."+'editor2';
            OpenAjax.hub.publish(topic, params);
        }
    };
    
    proto.getLastOp = function(){
        return this._lastOp;
    };
    
    return listener;
});