//
// Tests the UnamangedHubListener implementation of ListenerInterface.
// 
// Copyright (c) The Dojo Foundation 2011. All Rights Reserved.
//
/*global define module test raises deepEqual ok equal strictEqual*/
define([
    '../TextEditor',
    'org/OpenAjax',
    'coweb/collab/UnmanagedHubCollab'
], function(TextEditor, OpenAjax, UnmanagedHubCollab) {
    var modOpts = function() {
        return {
            setup: function() {
                var testNode = dojo.create('div',{id:'testNode'},'qunit-tests','after');
                this.editor = new TextEditor({id:'test', domNode: testNode});
                this.collab = new UnmanagedHubCollab();
                this.collab.init({id : 'test'});
            },
            teardown: function() {
                this.editor.cleanup();
                dojo.destroy('testNode');
            }
        };
    };

    module('listener bootstrap', modOpts());
    
    test('insert char inbound', 1, function() {
        //Simulate incoming sync
        this.collab.sendSync('editorUpdate', { 'char': 'a' }, 'insert', '0');
        //Verify we got it
        equals(dojo.attr(this.editor._textarea,'value'),"a");
    });
    
    test('update char inbound', 1, function() {
        //Insert char to replace
        this.editor.insertChar('a',0);
        //Simulate incoming sync
        this.collab.sendSync('editorUpdate', { 'char': 'b' }, 'update', '0');
        //Verify we got it
        equals(dojo.attr(this.editor._textarea,'value'),"b");
    });
    
    test('delete char inbound', 1, function() {
        //Insert char to delete
        this.editor.insertChar('a',0);
        //Simulate incoming sync
        this.collab.sendSync('editorUpdate', { }, 'delete', '0');
        //Verify we got it
        equals(dojo.attr(this.editor._textarea,'value'),"");
    });
});