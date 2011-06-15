//
// Tests the UnamangedHubListener implementation of ListenerInterface.
// 
// Copyright (c) The Dojo Foundation 2011. All Rights Reserved.
//
/*global define module test raises deepEqual ok equal strictEqual*/
define([
    '../TextEditor',
    'org/OpenAjax',
    'util',
    'listener',
], function(TextEditor, OpenAjax, util, listener) {
    var modOpts = function() {
        return {
            setup: function() {
                //1. Create 2 editors
                var testNode1 = dojo.create('div',{id:'testNode1'},'qunit-tests','after');
                this.editor1 = new TextEditor({id:'editor1', domNode: testNode1, go:false});
                var testNode2 = dojo.create('div',{id:'testNode2'},'qunit-tests','after');
                this.editor2 = new TextEditor({id:'editor2', domNode: testNode2, go:false});
                
                //4. Create opEngineClients
                this.a = new util.OpEngClient(1, {editorUpdate: ''});
                this.b = new util.OpEngClient(2, {editorUpdate: ''});
                
                this.listener1 = new listener({engine: this.a, collab: this.editor1.collab, local: 'editor1'});
                this.listener2 = new listener({engine: this.b, collab: this.editor2.collab, local: 'editor2'});
            },
            
            teardown: function() {
                // clean up all clients
                util.all_clients = [];
                util.order = 1;
                this.editor1.cleanup();
                this.editor2.cleanup();
                this.listener1.cleanup();
                this.listener2.cleanup();
                //dojo.destroy('testNode1');
                //dojo.destroy('testNode2');
            }
        };
    };

    module('listener bootstrap', modOpts());
    
    test('send single char', 5, function() {
        //Pause both, b/c no READY call is fired in testingin the editors...
        this.editor1.collab.pauseSync();
        this.editor2.collab.pauseSync();
        
        //Insert a char on 1 & invoke iteration loop to send syncs
        this.editor1.insertChar('a',0);
        this.editor1.iterate();

        //Invoke iteration loop to receive syncs on 2
        this.editor2.iterate();
        
        //Asserts
        var op = this.listener1.getLastOp();
        equals('insert',op["type"]);
        equals(0,op["position"]);
        deepEqual('a',op["value"]);
        equals(this.editor1._textarea.value, this.editor2._textarea.value);
        equals(this.editor1._textarea.value, this.a.state.editorUpdate);
    });

    
    test('send single char concurrent', 5, function() {
        //Pause both, b/c no READY call is fired when testing the editors...
        this.editor1.collab.pauseSync();
        this.editor2.collab.pauseSync();
        
        //Insert a char on BOTH & invoke iterationSend to send syncs
        this.editor1.insertChar('a',0);
        this.editor2.insertChar('b',0);
        this.editor1.iterateSend();
        this.editor2.iterateSend();
        
        //Invoke iterationRecv to receive syncs on BOTH
        this.editor1.iterateRecv();
        this.editor2.iterateRecv();
        
        //Asserts
        var op = this.listener1.getLastOp();
        equals('insert',op["type"]);
        equals(0,op["position"]);
        deepEqual('a',op["value"]);
        equals(this.editor1._textarea.value, this.editor2._textarea.value);
        equals(this.editor1._textarea.value, this.a.state.editorUpdate);
    });
    
});