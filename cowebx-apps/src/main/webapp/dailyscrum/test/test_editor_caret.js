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

    module('editor caret pos', modOpts());
    
    test('recv char stay in middle', 1, function() {
        //Pause both, b/c no READY call is fired in testingin the editors...
        this.editor1.collab.pauseSync();
        this.editor2.collab.pauseSync();
        this.editor1._onFocus();
        this.editor2._onFocus();
           
        this.editor1.insertString('abcdefgh',0);
        this.editor1.iterate();
        this.editor2.iterate();
        this.editor2.setPOR(2);
        this.editor1.insertString('abc',0);
        this.editor1.iterate();
        this.editor2.iterate();
        
        //Asserts
        equals(this.editor1._por.start, 0);
    });
});