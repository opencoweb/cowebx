#RichTextEditor Coweb Widget

For information on how to use this and other collaborative widgets in your application, see the documentation [here](http://opencoweb.org/ocwdocs/js/widgets.html).

#Dom-Based Editor
This editor stores the contents of the rich text editor as a DOM (html) tree. The benefits over keeping only the raw HTML string are that the editor can correctly use the OCW sync API to maintain convergent documents across all remote clients and performance improvements.

The DOM tree representation is custom and not related to any of JavaScript's specific DOM related classes. See the EditorTree class in TreeTools.js.
TreeTools.js contains the code that creates and manipulates the custom DOM trees. `EditorTree::treeDiff` takes two EditorTrees as arguments and computes a (not necessarily minimum) edit script to convert one tree into the other. Allowed operations are insert, delete, update, and move.

#Regression Testing
Changes to EditorTree should be checked against the regression test suite in regtest/tree_regtest.html. A set of tests are run to ensure the diff algorithm works correctly. The test set as of now is quite weak and can definitely use additional use cases.


