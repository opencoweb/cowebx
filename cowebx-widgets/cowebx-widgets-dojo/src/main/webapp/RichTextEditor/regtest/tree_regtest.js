
require(["dojo/dom", "dojo/_base/array", "TreeTools", "dojo/domReady!"], function(dom, array, EditorTree) {

    // This is from the RichTestEditor
    function preprocessTree(t) {
        /* Make sure the root is the exact node: `<div></div>`
           The assumption is that the only case where the roots don't initially match for the editor
           is when the innerHTML is something like `<div>..text...text..</div>`. */
        var tmp;
        if (null !== t.text) {
            tmp = new EditorTree(t);
            tmp.text = t.text;
            t.text = null;
            t.children = [tmp];
        }
    }

    function deepEquals(t1, t2, checkId) {
        if (undefined === checkId)
            checkId = false;
        if (t1.getLabel() != t2.getLabel() ||
            t2.getValue() != t2.getValue() ||
            (checkId && t1.id != t2.id) ||
            !!t1.children != !!t2.children ||
            (t1.children && t1.children.length != t2.children.length)) {
            return false;
        }
        array.forEach(t1.children, function(at, i) {
            if (!deepEquals(at, t2.children[i]))
                return false;
        });
        return true;
    }

    /* Our regression tests test higher level functionality: we only care that the
       tree differ can generate an EditScript to transform tree1 into tree2. The
       exact EditScript generated might change as the diff algorithm is updated and
       optimized.

       The input data is a set of tuples defined in tree_regtest.html. Each <div>
       element inside the outer <div id="test_set"> elements define a test tuple. Ex:

       <div id="test4">
         <div id="test4_old">...</div>
         <div id="test4_new">...</div>
       </div>

       The test4_old and test4_new <div>s are the old and new HTML elements to run
       through the tree diff algorithm. Failures are reported at the end of the test.

       The first and second <divs> inside each test <div> should have their ids set
       to `X_old` and `X_new`, where X is the id of the outer test <div>. See the
       above example.

     */

    var Failures = [];
    function doTest(at) {
        var idCounter = 0;
        var id1 = at[0];
        var id2 = at[1];
        var tree1 = EditorTree.createTreeFromElement(id1);
        var tree2 = EditorTree.createTreeFromElement(id2);
        tree2.beginTag = tree1.beginTag;
        preprocessTree(tree1);
        preprocessTree(tree2);
        var html1 = dom.byId(id1);
        var html2 = dom.byId(id2);
        // Give tree1 some dummy ids.
        tree1.levelOrder(function(at) { at.id = idCounter++; });
        var diffs = EditorTree.treeDiff(tree1, tree2);
        if (!deepEquals(tree1, tree2)) {
            Failures.push(id1.substring(0, id1.length - 4));
        }

        // Now, apply diffs to tree1 (EditorTree.treeDiff changes tree1 as it proceeds).
        var tree1_tochange = EditorTree.createTreeFromElement(id1);
        preprocessTree(tree1_tochange);
        // Give tree1 the SAME dummy ids as the original tree1.
        idCounter = 0;
        tree1_tochange.levelOrder(function(at) { at.id = idCounter++; });
        var tree1Map = {};
        tree1_tochange.levelOrder(function(at) {
            tree1Map[at.id] = at;
        });
        array.forEach(diffs, function(at) {
            var w;
            var ty = at.ty;
            var args = at.args;
            if ("insert" == ty) {
                w = EditorTree.applyIns(args.x, tree1Map[args.y.id], args.k, args.newId);
                tree1Map[w.id] = w;
            } else if ("update" == ty) {
                EditorTree.applyUpd(tree1Map[args.x.id], args.val);
            } else if ("move" == ty) {
                EditorTree.applyMov(tree1Map[args.x.id], tree1Map[args.y.id], args.k, args.oldK);
            } else if ("delete" == ty) {
                EditorTree.applyDel(tree1Map[args.x.id], args.k);
            }
        });
        if (!deepEquals(tree1, tree1_tochange)) {
            Failures.push(id1.substring(0, id1.length - 4));
        }
    }

    var TestSet = [];
    function createTest(node) {
        var a = node.children[0].id;
        var b = node.children[1].id;
        TestSet.push([a, b]);
    }

    // Find test set.
    array.forEach(dom.byId("test_set").childNodes, function(at) {
        if (at.tagName && "div" == at.tagName.toLowerCase())
            createTest(at);
    });

    // Run test set.
    array.forEach(TestSet, doTest);

    var results;
    if (Failures.length) {
        results = dom.byId("bad");
        results.innerHTML = Failures.join("<br />");
        results.style.display = "block";
    } else {
        dom.byId("good").style.display = "block";
    }

});

