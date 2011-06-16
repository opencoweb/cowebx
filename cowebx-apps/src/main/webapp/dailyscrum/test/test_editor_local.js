//
// Tests the UnamangedHubListener implementation of ListenerInterface.
// 
// Copyright (c) The Dojo Foundation 2011. All Rights Reserved.
//
/*global define module test raises deepEqual ok equal strictEqual*/
define([
    '../TextEditor',
    ''
], function(TextEditor) {
    var modOpts = function() {
        return {
            setup: function() {
                var testNode = dojo.create('div',{id:'testNode'},'qunit-tests','after');
                this.editor = new TextEditor({id:'textEditor', domNode: testNode});
            },
            teardown: function() {
                this.editor.cleanup();
                dojo.destroy('testNode');
            }
        };
    };

    module('editor local', modOpts());
    
    test('insert char beginning', 1, function() {
        this.editor.insertChar("a",0);
        equals(dojo.attr(this.editor._textarea,'value'),"a");
    });
    
    test('insert chars beginning', 1, function() {
        this.editor.insertChar("abc",0);
        equals(dojo.attr(this.editor._textarea,'value'),"abc");
    });
    
    test('insert char end', 1, function() {
        this.editor.insertChar("abc",0);
        this.editor.insertChar("d",3);
        equals(dojo.attr(this.editor._textarea,'value'),"abcd");
    });
    
    test('insert chars end', 1, function() {
        this.editor.insertChar("abc",0);
        this.editor.insertChar("def",3);
        equals(dojo.attr(this.editor._textarea,'value'),"abcdef");
    });
    
    test('insert char middle', 1, function() {
        this.editor.insertChar("abc",0);
        this.editor.insertChar("efg",3);
        this.editor.insertChar("d",3);
        equals(dojo.attr(this.editor._textarea,'value'),"abcdefg");
    });
    
    test('insert chars middle', 1, function() {
        this.editor.insertChar("abc",0);
        this.editor.insertChar("ghi",3);
        this.editor.insertChar("def",3);
        equals(dojo.attr(this.editor._textarea,'value'),"abcdefghi");
    });
    
    test('delete char beginning', 1, function() {
        this.editor.insertChar("a",0);
        this.editor.deleteChar(0);
        equals(dojo.attr(this.editor._textarea,'value'),"");
    });
    
    test('delete char end', 1, function() {
        this.editor.insertChar("abc",0);
        this.editor.deleteChar(2);
        equals(dojo.attr(this.editor._textarea,'value'),"ab");
    });

    test('delete char middle', 1, function() {
        this.editor.insertChar("abc",0);
        this.editor.deleteChar(1);
        equals(dojo.attr(this.editor._textarea,'value'),"ac");
    });
    
    test('update char beginning', 1, function() {
        this.editor.insertChar("a",0);
        this.editor.updateChar("b",0);
        equals(dojo.attr(this.editor._textarea,'value'),"b");
    });
    
    test('update char end', 1, function() {
        this.editor.insertChar("abc",0);
        this.editor.updateChar("d",2);
        equals(dojo.attr(this.editor._textarea,'value'),"abd");
    });

    test('update char middle', 1, function() {
        this.editor.insertChar("abc",0);
        this.editor.updateChar("x",1);
        equals(dojo.attr(this.editor._textarea,'value'),"axc");
    });
});