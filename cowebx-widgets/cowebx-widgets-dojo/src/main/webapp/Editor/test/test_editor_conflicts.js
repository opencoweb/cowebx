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
                dojo.destroy('testNode1');
                dojo.destroy('testNode2');
            }
        };
    };

    module('editor conflicts', modOpts());
    
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
    
    test('delete single char', 2, function() {
        //Pause both, b/c no READY call is fired in testingin the editors...
        this.editor1.collab.pauseSync();
        this.editor2.collab.pauseSync();
        
        //Insert a char on 1 & invoke iteration loop to send syncs
        this.editor1.insertChar('a',0);
        this.editor1.iterate();

        //Invoke iteration loop to receive syncs on 2
        this.editor2.iterate();
        
        //Delete on 1 & invoke iteration loop to send syncs
        this.editor1.deleteChar(0);
        this.editor1.iterate();
        
        //Invoke iteration loop to receive syncs on 2
        this.editor2.iterate();
        
        //Asserts
        var op = this.listener1.getLastOp();
        equals(this.editor1._textarea.value, this.editor2._textarea.value);
        equals(this.editor1._textarea.value, this.a.state.editorUpdate);
    });
    
    test('delete single char consecutive', 2, function() {
        //Pause both, b/c no READY call is fired in testingin the editors...
        this.editor1.collab.pauseSync();
        this.editor2.collab.pauseSync();
        
        //Insert a char on 1 & invoke iteration loop to send syncs
        this.editor1.insertString('ab',0);
        this.editor1.iterate();
        
        //Delete on 1 & invoke iteration loop to send syncs
        this.editor1.deleteChar(0);
        this.editor1.iterate();
        this.editor2.iterate();
        
        //Delete on 1 & invoke iteration loop to send syncs
        this.editor2.deleteChar(0);
        this.editor2.iterate();
        this.editor1.iterate();
        
        equals(this.editor1._textarea.value, this.editor2._textarea.value);
        equals(this.editor1._textarea.value, this.a.state.editorUpdate);
    });
    
    test('delete single char concurrent', 2, function() {
        //Pause both, b/c no READY call is fired in testingin the editors...
        this.editor1.collab.pauseSync();
        this.editor2.collab.pauseSync();
        
        //Insert a char on 1 & invoke iteration loop to send syncs
        this.editor1.insertString('ab',0);
        this.editor1.iterate();
        
        //Delete on 1 & invoke iteration loop to send syncs
        this.editor1.deleteChar(0);
        this.editor2.deleteChar(1);
        this.editor1.iterateSend();
        this.editor2.iterateSend();
        
        //Delete on 1 & invoke iteration loop to send syncs
        this.editor1.iterateRecv();
        this.editor2.iterateRecv();
        
        equals(this.editor1._textarea.value, this.editor2._textarea.value);
        equals(this.editor1._textarea.value, this.a.state.editorUpdate);
    });
    
    test('send strings concurrent', 2, function() {
        //Pause both, b/c no READY call is fired when testing the editors...
        this.editor1.collab.pauseSync();
        this.editor2.collab.pauseSync();
        
        //Insert strings on BOTH
        this.editor1.insertChar('Gordon Freeman lives. ',0);
        this.editor2.insertChar('Black Mesa is real. ',0);

        //Invoke iterationSend to send syncs
        this.editor1.iterateSend();
        this.editor2.iterateSend();
        
        //Invoke iterationRecv to receive syncs on BOTH
        this.editor1.iterateRecv();
        this.editor2.iterateRecv();
        
        //Asserts
        equals(this.editor1._textarea.value, this.editor2._textarea.value);
        equals(this.editor1._textarea.value, this.a.state.editorUpdate);
    });
    
    test('send strings consecutive', 2, function() {
        //Pause both, b/c no READY call is fired when testing the editors...
        this.editor1.collab.pauseSync();
        this.editor2.collab.pauseSync();
        
        //Insert strings on BOTH
        this.editor1.insertChar('Gordon Freeman lives. ',0);
        this.editor1.iterateSend();
        this.editor2.iterateSend();
        this.editor1.iterateRecv();
        this.editor2.iterateRecv();
        
        //Invoke iterationSend to send syncs
        this.editor2.insertString('Black Mesa is real. ',0);
        this.editor1.iterateSend();
        this.editor2.iterateSend();
        this.editor1.iterateRecv();
        this.editor2.iterateRecv();
        
        //Asserts
        equals(this.editor1._textarea.value, this.editor2._textarea.value);
        equals(this.editor1._textarea.value, this.a.state.editorUpdate);
    });
    
    test('send strings into state', 3, function() {
        //Pause both, b/c no READY call is fired when testing the editors...
        this.editor1.collab.pauseSync();
        this.editor2.collab.pauseSync();
        
        //Insert a string on 1
        this.editor1.insertString('Gordon Freeman lives. ',0);
        
        //Iterate send/recv to get string over to 2
        this.editor1.iterateSend();
        this.editor2.iterateRecv();
        equals(this.editor1._textarea.value, this.editor2._textarea.value);
        
        //Insert a string on to 2, send
        this.editor2.insertString('Black Mesa is real. ',0);
        this.editor2.iterateSend();
        
        //Invoke iterationRecv pull 2 to 1
        this.editor1.iterateRecv();
        
        //Asserts
        equals(this.editor1._textarea.value, this.editor2._textarea.value);
        equals(this.editor1._textarea.value, this.a.state.editorUpdate);
    });
    
    test('paste beginning while typing', 3, function() {
        //Pause both, b/c no READY call is fired when testing the editors...
        this.editor1.collab.pauseSync();
        this.editor2.collab.pauseSync();
        
        //Start typing on 1...
        this.editor1.insertString('Gordon Freeman lives. ',0);
        
        //Simulate timer firing and assert
        this.editor1.iterateSend();
        this.editor2.iterateSend();
        this.editor1.iterateRecv();
        this.editor2.iterateRecv();
        equals(this.editor1._textarea.value, this.editor2._textarea.value);
        
        //Continue typing on 1 & paste on 2...
        this.editor1.insertString('Black Mesa is real. ',22);
        this.editor2.insertString('THIS IS A HUGE PASTE AT BEGINNING OF LINE. ',0);
        
        //Send/recv on both
        this.editor1.iterateSend();
        this.editor2.iterateSend();
        this.editor1.iterateRecv();
        this.editor2.iterateRecv();
        
        //Asserts
        equals(this.editor1._textarea.value, this.editor2._textarea.value);
        equals(this.editor1._textarea.value, this.a.state.editorUpdate);
    });
    
    test('paste middle while typing', 3, function() {
        //Pause both, b/c no READY call is fired when testing the editors...
        this.editor1.collab.pauseSync();
        this.editor2.collab.pauseSync();
        
        //Start typing on 1...
        this.editor1.insertString('Gordon Freeman lives. ',0);
        
        //Simulate timer firing and assert
        this.editor1.iterateSend();
        this.editor2.iterateSend();
        this.editor1.iterateRecv();
        this.editor2.iterateRecv();
        equals(this.editor1._textarea.value, this.editor2._textarea.value);
        
        //Continue typing on 1 & paste on 2...
        this.editor1.insertString('Black Mesa is real. ',22);
        this.editor2.insertString('THIS IS A HUGE PASTE AFTER THE WORD GORDON. ',7);
        
        //Send/recv on both
        this.editor1.iterateSend();
        this.editor2.iterateSend();
        this.editor1.iterateRecv();
        this.editor2.iterateRecv();
        
        //Asserts
        equals(this.editor1._textarea.value, this.editor2._textarea.value);
        equals(this.editor1._textarea.value, this.a.state.editorUpdate);
    });
    
    test('paste end while typing', 3, function() {
        //Pause both, b/c no READY call is fired when testing the editors...
        this.editor1.collab.pauseSync();
        this.editor2.collab.pauseSync();
        
        //Start typing on 1...
        this.editor1.insertString('Gordon Freeman lives. ',0);
        
        //Simulate timer firing and assert
        this.editor1.iterateSend();
        this.editor2.iterateSend();
        this.editor1.iterateRecv();
        this.editor2.iterateRecv();
        equals(this.editor1._textarea.value, this.editor2._textarea.value);
        
        //Continue typing on 1 & paste on 2...
        this.editor1.insertString('Black Mesa is real. ',22);
        this.editor2.insertString('THIS IS A HUGE PASTE AFTER THE FIRST SENTENCE ABOUT GORDON. ',22);
        
        //Send/recv on both
        this.editor1.iterateSend();
        this.editor2.iterateSend();
        this.editor1.iterateRecv();
        this.editor2.iterateRecv();
        
        //Asserts
        equals(this.editor1._textarea.value, this.editor2._textarea.value);
        equals(this.editor1._textarea.value, this.a.state.editorUpdate);
    });
});