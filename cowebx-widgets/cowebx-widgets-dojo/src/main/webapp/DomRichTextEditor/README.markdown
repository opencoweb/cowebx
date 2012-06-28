#Dom Based RichTextEditor Coweb Widget

For information on how to use this and other collaborative widgets in your application, see the documentation [here](http://opencoweb.org/ocwdocs/js/widgets.html).

Functionality and Correctness
-----------------------------
The raw HTML text editor keeps track of a single string of HTML and sends sync events based on changes to that raw string. However, it is provably incapable of maintaining semantic consistency when simultaneous remote users make changes to the document. See the below link on syntactical vs. semantic consistency.

The inherent issue is that the OCW API has no knowledge about the underly string being synchronized. Even though the HTML string will *always* converge to the same string as guaranteed by the OCW API, the certain cases the string will become invalid HTML markup that is meaningless for the rich text editor.

The Dom Based editor alleviates this underlying problem by working at a higher semantic level - the Dom tree.

Tree Structure
--------------

The Dom Based RichTextEditor keeps the internal state of the text the same way a browser does - as a tree. This is useful for many reasons:
 * The OCW API does a better job of synchronizing the editor when the underlying data is kept at a higher semantic level. See [syntactical vs. semantic consistency](http://opencoweb.org/ocwdocs/tutorial/semantics.html) for more.
 * The associated algorithm for determining what sync events (the *diff* algorithm) is faster. The raw HTML based editor uses the [levenshtein distance](http://en.wikipedia.org/wiki/Levenshtein_distance) algorith, which is quadratic in runtime.
 * Less sync events are sent to other clients. Changing a sentence will only send one `update` event with the Dom Based editor, but will send as many single character changes as computed by the levenshtein algorithm.

