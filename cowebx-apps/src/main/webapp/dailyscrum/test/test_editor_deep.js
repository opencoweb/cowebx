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
                //1. Create editor
                var testNode = dojo.create('div',{id:'testNode'},'qunit-tests','after');
                this.editor = new TextEditor({id:'test', domNode: testNode});
                
                //2. Create 2 collabs
                this.collab1 = new UnmanagedHubCollab();
                this.collab1.init({id : '1'});
                this.collab2 = new UnmanagedHubCollab();
                this.collab2.init({id : '2'});
                
                //3. Create 2 fake listeners
                this.listener1 = new listener();
                this.listener2 = new listener();
                
                //4. Create opEngineClients
                var a = new util.OpEngClient(1, {});
                var b = new util.OpEngClient(2, {});
            },
            teardown: function() {
                this.editor.cleanup();
                dojo.destroy('testNode');
            }
        };
    };

    module('listener bootstrap', modOpts());
    
    
});