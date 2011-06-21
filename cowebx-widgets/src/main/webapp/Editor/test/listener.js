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
        this._mutex = false;
        
        this.collab.pauseSync = dojo.hitch(this, '_pause');
        this.collab.resumeSync = dojo.hitch(this, '_resume');
        this.token = OpenAjax.hub.subscribe('coweb.sync.editorUpdate.'+this.local, '_syncOutbound', this);
    };
    var proto = listener.prototype;

    proto._syncOutbound = function(topic, event) {
        if(this._mutex) {
            return;
        }
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
        for(var i=0; i<ops.length; i++){
            var params = {value: ops[i].value, type: ops[i].type, position: ops[i].position}
            var topic = ops[i].key;
            var topic = 'coweb.sync.'+topic+"."+this.local;
            this._mutex = true;
            OpenAjax.hub.publish(topic, params);
            this._mutex = false;
        }
    };
    
    proto.getLastOp = function(){
        return this._lastOp;
    };
    
    proto.cleanup = function(){
        OpenAjax.hub.unsubscribe(this.token);
    };
    
    return listener;
});