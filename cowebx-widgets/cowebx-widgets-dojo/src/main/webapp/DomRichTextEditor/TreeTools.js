
// TODO see if we can optimize the indexOf's? is it worth it?
var COUNTER={};
COUNTER.option1=1;
COUNTER.option2=1;
var DEBUG1 = false;
function tabs(n) {
    return "                                            ".substring(0, n*4);
}
function checkPoison(x) {
    if (x==0xdeadbeef)
    {
        console.error("poison!");
        return false;
    }
    return true;
}

define([
        "dojo/dom",
        "dojo/_base/array",
        "./ld",
//        "/Users/ibmcoop/dojo/www/ld.js",
        "./lib/diff_match_patch"
    ], function(dom, array, LD) {

    // IE doesn't have Node.
    if (!window["Node"]) {
        window.Node = new Object();
        Node.ELEMENT_NODE = 1;
        Node.ATTRIBUTE_NODE = 2;
        Node.TEXT_NODE = 3;
        Node.CDATA_SECTION_NODE = 4;
        Node.ENTITY_REFERENCE_NODE = 5;
        Node.ENTITY_NODE = 6;
        Node.PROCESSING_INSTRUCTION_NODE = 7;
        Node.COMMENT_NODE = 8;
        Node.DOCUMENT_NODE = 9;
        Node.DOCUMENT_TYPE_NODE = 10;
        Node.DOCUMENT_FRAGMENT_NODE = 11;
        Node.NOTATION_NODE = 12;
    }

    var ld = new LD(); // Used to calculate leaf node similarity.
    var differ = new diff_match_patch();

    // Global variables are fine since JavaScript is reentrant.
    var globalIdCounter = null;

    /* Essentially there are two types of nodes:
         1. Internal nodes represent a JavaScript DomNode.
         2. Leaf nodes contain the text of the HTML tag.
       There is an exception - empty HTML elements (ex: "<b></b>") will be a leaf node.
       Use the nodeType member to determime the type of node (either Node.ELEMENT_NODE
       or Node.TEXT_NODE).

       TODO remove depth comptuation.

       The constructor simple sets all members to null. `parent` is null only for the root.
       */
    var mangledObj = {wont:123,work:321};
    var EditorTree = function(p, id) {
        this.parent     = p;
        this.diffId     = mangledObj; // For diff computation.
        this.inOrder    = 0xdeadbeef; // Also for diff computation.
        this.nodeType   = null;
        this.children   = null;
        this.matched    = null;
        if (p)
            this.depth      = p.depth + 1;
        else
            this.depth      = 0;

        if (undefined === id)
            this.id = 0xdeadbeef;
        else
            this.id = id
        this.beginTag   = null;
        this.endTag     = null;
        this.text       = null;
    };

    // TODO is this correct?
    EditorTree.equalsDeep = function(x, y) {
        if (!x && !y) {
            console.error("both x,y false");
            return true;
        }
        if ((!x && y) || x && !y)
        {
            console.error("one of x,y false",x,y);
            return false;
        }
        if (x.beginTag == y.beginTag && x.text == y.text) {
            if (x.depth == y.depth)
                return true;
            else
                return false;
        } else {
            return false;
        }
    };

    EditorTree.compare = function(x, y) {
        return EditorTree.equalsDeep(x,y) ? 0 : 1;
    };

    // For the matching algorithm, we only  TODO add cache for indexOf
    EditorTree.equalMatch = function(x, y) {
        if (!x && !y) {
            console.error("both x,y false");
            return true;
        }
        if ((!x && y) || x && !y)
        {
            console.error("one of x,y false",x,y);
            return false;
        }
        if (x.beginTag == y.beginTag && x.text == y.text) {
            if (x.depth == y.depth)
                return true;
            else
                return false;
        } else {
            return false;
        }
    };

    var proto = EditorTree.prototype;

    proto.data =  function() {
        //return [this.beginTag, this.endTag, this.text, this.nodeType, this.id];
        return {
            beginTag    : this.beginTag,
            endTag      : this.endTag,
            text        : this.text,
            nodeType    : this.nodeType
        };
    };

    proto.sanityCheck = function() {
        var ret = true;
        if (this.parent && this.parent.children.indexOf(this) < 0) {
            console.error("sanity 1 failed");
            return false;
        }
        array.forEach(this.children, function(at, i) {
            if (false === (ret = ret && at.sanityCheck()))
                return;
        });
        return ret;
    };

    proto.getLabel = function() {
        if (Node.ELEMENT_NODE == this.nodeType)
            return this.beginTag;
        else
            return "TEXT_NODE"
    };

    // TODO make better for non text nodes.
    proto.getValue = function() {
        return null !== this.text ? this.text : "";
    };

    // TODO consider making functions non-recursive.
    proto.toString = function(depth,test) {
        if (undefined === depth || null === depth)
            depth = 0;
        var s = tabs(depth);
        if (this.beginTag)
            s += this.beginTag;
        if (this.text)
            s += this.text;
        s += "id="+this.id+"\n";
        ++depth;
        array.forEach(this.children, function(child, i) {
            s += child.toString(depth,test);
        });
        return s;
    };

    proto.valueOf = function() {
        if (Node.ELEMENT_NODE == this.nodeType)
            return this.beginTag+"("+this.diffId+")";
        else
            return this.text+"("+this.diffId+")";
    };

    // TODO consider making functions non-recursive.
    /* Convert the tree into a raw HTML string we can use to set innerHTML. */
    proto.toHTML = function() {
        /* JavaScript's += is apparently really fast, so no need to worry about large
           strings. Also, JavaScript is reentrant, so don't worry about using the global
           variable `s`. */
        var s;
        if (Node.ELEMENT_NODE == this.nodeType) {
            s = this.beginTag;
            if (null === this.text) {
                array.forEach(this.children, function(child, i) {
                    s += child.toHTML();
                });
            } else {
                s += this.text;
            }
            s += this.endTag;
            return s;
        } else {
            return this.text;
        }
    };

    proto.levelOrder = function(cb) {
        var q = [this];
        var at;
        while (q.length > 0) {
            at = q.shift();
            cb(at);
            array.forEach(at.children, function(child, i) {
                q.push(child);
            });
        }
    };

    // TODO make iterative
    proto.postOrder = function(cb) {
        array.forEach(this.children, function(at, i) {
            at.postOrder(cb);
        });
        cb(this);
    };

    /* Performs a level order traversal where the levels are visited in ascending order. Ex:
        A
        |\
        | --
        |   \
        B    C
        |\   |\
        D E  F G

        specialLevelOrder will visit the nodes in this order: D E F G B C A
        */
    proto.specialLevelOrder = function(cb) {
        var q, at, depths, i;
        q = [this];
        depths = [];
        while (q.length > 0) {
            at = q.shift();
            if (at.depth > depths.length) { console.error("depths broken");
            } else if (at.depth == depths.length) {
                depths.push([]);
            }
            depths[at.depth].push(at);
            array.forEach(at.children, function(child, i) {
                q.push(child);
            });
        }
        for (i = depths.length - 1; i >= 0; --i) {
            array.forEach(depths[i], function(at, i) {
                cb(at);
            });
        }
    };

    proto.equalsDeep = function(o) {
        return EditorTree.equalsDeep(this, o);
    };

    proto.copyFrom = function(o) {
        this.beginTag = o.beginTag;
        this.endTag = o.endTag;
        this.text = o.text;
        this.nodeType = o.nodeType;
    };

    function similarity(a, b) {
        var dist, max, diffs;
        //console.log("similarity("+a+","+b+")=");
        max = Math.max(a.length, b.length);
        if (0 == max)
            return 1.0;
        if (0 == Math.min(a.length, b.length))
            return 1.0;
        if (!COUNTER.option2) {
            if (a == b)
                dist = 0;
            else {
                // TODO use smart ld bounds.
                dist = ld.ld(a, b).length;
                COUNTER.ldcalls++;
            }
        } else {
            diffs = differ.diff_main(a, b);
            dist = 0;
            array.forEach(diffs, function(at) {
                switch(at[0]) {
                    case 1:
                    case -1:
                        dist += at[1].length;
                        break;
                }
            });
        }
        //console.log(1.0-dist/max);
        return 1.0 - dist / max;
    }

    // y - parent, k - child position, x - data to copy.
    // Only insert leaves.
    EditorTree.applyIns = function(x, y, k, newId) {
        DEBUG1?console.log("applyIns",x.valueOf(),y.valueOf(),k):null;
        toAdd = new EditorTree(y);
        toAdd.id = newId;
        toAdd.inOrder = false; // TODO is this correct?
        toAdd.copyFrom(x);
        if (null === y.children) {
            if (k!=0)
                console.error("k!=0");
            y.children = [toAdd];
        } else
            y.children.splice(k, 0, toAdd);
        return toAdd;
    };

    EditorTree.applyUpd = function(x, val) {
        //console.error("applyUpd called");
        DEBUG1?console.log("applyUpd",x.valueOf(),val.valueOf()):null;
        x.copyFrom(val);
    };

    // Assumes x is a leaf node.
    EditorTree.applyDel = function(x, k) {
        DEBUG1?console.log("applyDel",x.valueOf()):null;
        var siblings, p;
        p = x.parent;
        siblings = p.children;
        if (x.children)
            console.error("applyDEL not leaf");
        siblings.splice(k, 1);
        if (0 == siblings.length)
            p.children = null;
    };

    EditorTree.applyMov = function(x, y, k, oldK) {
        DEBUG1?console.log("applyMov",x.valueOf(),y.valueOf(),k):null;
        var xparent;
        xparent = x.parent;
        xparent.children.splice(oldK, 1);
        if (0 == xparent.children.length)
            xparent.children = null;
        x.parent = y;
        x.depth = y.depth + 1;
        if (null === y.children) {
            if (0!=k)
                console.error("k!=0");
            y.children = [x];
        } else
            y.children.splice(k, 0, x);
    };

    var t11,t21,MMP; // TODO remove
    /* Creates a custom tree representation of a DomNode. The structure of the custom
       tree nodes is:
         * tag - Name of the node element's tag. Ex: "b"
         * attributes - Raw string of the node's attributes. Ex: " class='big'"
         * children - Array of nodes.
       */
    // TODO should I use a comprehensive list? might not be as fast...
    //var emptyTagList = ["br", "hr", "img", "link", "input", "area", "param", "col", "meta", "base", "embed"];
    var emptyTagList = ["br", "hr", "img"];
    EditorTree.createTreeFromElement = function(id) {
        function extractHTML(domNode, treeNode) {
            /* Extracts the first tag and its contents. The results are stored in `node`.
               Example: extractHTML("<b class='big'><u>hello</u></b>", tree) sets
               tree.beginTag = "<b class='big'>' and tree.endTag = "</b>".

               This function makes assumptions about the structure of the raw outerHTML string.

               Returns true if this node is a pseudo leaf - a DOM node with a single TEXT_NODE child, false otherwise.
               */
            var end, outer, tagLen, innerLen, child;
            outer = domNode.outerHTML;
            treeNode.nodeType = domNode.nodeType;
            if (emptyTagList.indexOf(domNode.tagName.toLowerCase()) >= 0) {
                treeNode.beginTag = outer.substring(0, domNode.tagName.length + 2);
                treeNode.endTag = "";
                return;
            }
            tagLen = domNode.tagName.length;
            innerLen = domNode.innerHTML.length;
            // Use innerHTML to determine where the outerHTML start tag ends.
            end = outer.length - innerLen - 3 - tagLen;

            treeNode.beginTag = outer.substring(0, end);
            treeNode.endTag = outer.substring(end + innerLen);
            if (1 == domNode.childNodes.length &&
                    Node.TEXT_NODE == (child = domNode.childNodes[0]).nodeType) {
                treeNode.text = child.nodeValue;
                return true;
            } else {
                treeNode.text = null;
                return false;
            }
        }
        function helper(node, at, depth) {
            /* Assign the current node first, then iterate over children. */
            if (extractHTML(node, at))
                return;
            if (0 == node.childNodes.length)
                return;
            at.children = [];
            array.forEach(node.childNodes, function(child, i) {
                var newNode = new EditorTree(at, idCounter++);
                switch (child.nodeType) {
                    case Node.ELEMENT_NODE:
                        helper(child, newNode, depth + 1);
                        break;
                    case Node.TEXT_NODE:
                        newNode.nodeType = Node.TEXT_NODE;
                        newNode.text = child.nodeValue;
                        break;
                    default: // TODO remove
                        console.error("nodeType is ",child.nodeType, child);
                        break;
                }
                at.children.push(newNode);
            });
        }
        var idCounter = 0;
        var elem = dom.byId(id);
        if (!elem)
            return null;
        var tree = new EditorTree(null, idCounter++);
        helper(elem, tree, 0);
        return tree;
    }

    // http://ilpubs.stanford.edu:8090/115/1/1995-46.pdf
    // TODO there is a faster match algorithm.
    function getPartialMatches(t1, t2) {
        if(DEBUG1){
        console.log(t1.toString());
        console.log(t2.toString());
        console.log(t1.toHTML());
        console.log(t2.toHTML());}
        function equal1(x, y) {
            return x.getLabel() == y.getLabel() && similarity(x.getValue(), y.getValue()) >= .6;
        }
        function equal2(x, y) {
            return x.getLabel() == y.getLabel() && common(x, y, M) >= .5;
        }
        function findMatch(node, t) {
            var idx = -1;
            var isNodeLeaf = !node.children;
            array.some(t, function(at, i) {
                    ++COUNTER.findmatch;
                /*if (!at.matched && isNodeLeaf == !at.children) {
                    if ((isNodeLeaf && equal1(node, at)) || equal2(node, at)) {
                        idx = i;
                        return true;
                    }
                }*/
                if (!at.matched && equal1(node, at)) {
                    idx = i;
                    return true;
                }
                return false;
            });
            return idx;
        }
        COUNTER.findmatch=0;
        COUNTER.ldcalls = 0;
        var M = {};
        var t1Queue;
        var t2List;

        M[t1.diffId] = t2;
        M[t2.diffId] = t1;
        t1.matched = true;
        t2.matched = true;
        t1Queue = [];
        t1.levelOrder(function(at) {
            t1Queue.push(at);
        });
        t2List = [];
        t2.levelOrder(function(at) {
            t2List.push(at);
        });
        // Make sure to work bottom-up for a more optimal matching.
        t1Queue.reverse();
        t2List.reverse();
        array.forEach(t1Queue, function(at, i) {
            var idx;
            if (!at.matched) {
                // TODO can we optimize this search instead of an O(n)?
                idx = findMatch(at, t2List);
                if (idx >= 0) {
                    at.matched = true;
                    t2List[idx].matched = true;
                    M[at.diffId] = t2List[idx];
                    M[t2List[idx].diffId] = at;
                    if(COUNTER.option1)t2List.splice(idx, 1);
                }
            }
        });
        return M;
    }

    function fastMatch(t1, t2) {
        var in1, in2, leafLabels, internalLabels;
        in1 = [];
        in2 = [];
        leafLabels = {};
        internalLabels = {};
        t1.specialLevelOrder(function(at) {
            if (at.children)
                internalLabels[at.getLabel()] = true;
            else
                leafLabels[at.getLabel()] = true;
            in1.push(at);
        });
        t2.specialLevelOrder(function(at) {
            if (at.children)
                internalLabels[at.getLabel()] = true;
            else
                leafLabels[at.getLabel()] = true;
            in2.push(at);
        });
        for (l in leafLabels) {

        }
    }

    function common(x, y, Matches) {
        return 1;
        /* common(x,y) = {(w,z) \in M : w is a leaf of x and z is a leaf of y}.
           This function returns the order of common(x,y), i.e. |common(x,y)|. */
        var nleaves1, nleaves2, count;
        nleaves1 = 0;
        nleaves2 = 0;
        count = 0;
        x.levelOrder(function(at) {
            if (!at.children) {
                ++nleaves1;
                var b = Matches[at.diffId];
                if (b && !b.children)
                    ++count;
            }
        });
        y.levelOrder(function(at) {
            if (!at.children)
                ++nleaves2;
        });
        var qwe = 1.0 * count / Math.max(nleaves1, nleaves2);
        return qwe;
    }

    function changeDistillingMatch(t1, t2) {
        console.log(t1.toHTML());
        console.log(t2.toHTML());
        console.log(t1.toString());
        console.log(t2.toString());
        var fThreshold = .6; // TODO tune this?
        var tThreshold = .6;
        var tThresholdExtra = .8;
        // TODO inline this.
        function match1(x, y) {
            // Return false if no match, otherwise return the value similarity.
            var sim = similarity(x.getValue(), y.getValue());
            if (x.getLabel() == y.getLabel() && sim >= fThreshold)
                return sim;
            else
                return false;
        }
        function match2(x, y) {
            // TODO which one?
            /*return (x.getLabel() == y.getLabel() &&
                    similarity(x.getValue(), y.getValue()) >= fThreshold &&
                    common(x, y) >= tThreshold); */
            var sim, com;
            if (x.getLabel() == y.getLabel()) {
                sim = similarity(x.getValue(), y.getValue());
                com = common(x, y, Mfinal);
                if ((sim >= fThreshold && com >= fThreshold) || com >= tThresholdExtra)
                    return true;
            }
            return false;
        }

        var Mfinal, Mtmp;
        var leaves1, leaves2, post1, post2;
        leaves1 = [];
        leaves2 = [];
        Mfinal = {};
        t1.levelOrder(function(at) {
            if (!at.children)
                leaves1.push(at);
        });
        t2.levelOrder(function(at) {
            if (!at.children)
                leaves2.push(at);
        });
        Mtmp = [];
        array.forEach(leaves1, function(a) {
            // TODO might need to find "best match," not first match.
            array.forEach(leaves2, function(b) {
                var sim = match1(a, b);
                if (false !== sim) {
                    Mtmp.push({a:a, b:b, sim:sim});
                    return true;
                }
                return false;
            });
        });
        console.log("mtmp",Mtmp);
        // Now, sort the leaves based on sim. TODO do this online with a [balanced] BST.
        var i, j, tmp;
        for (i = 1; i < Mtmp.length-1; ++i) {
            tmp = Mtmp[i];
            j = i;
            while (j > 0 && Mtmp[j-1].sim > tmp.sim) {
                Mtmp[j] = Mtmp[j-1];
                --j;
            }
            Mtmp[j] = tmp;
        }
        array.forEach(Mtmp, function(at) {
            var a = at.a;
            var b = at.b;
            if (a.matched || b.matched)
                return;
            Mfinal[a.diffId] = b;
            Mfinal[b.diffId] = a;
            a.matched = true;
            b.matched = true;
        });
        console.log(Mfinal);
        post1 = [];
        post2 = [];
        t1.postOrder(function(at) {
            if (!at.matched)
                post1.push(at);
        });
        t2.postOrder(function(at) {
            if (!at.matched)
                post2.push(at);
        });
        array.forEach(post1, function(a) {
            var found;
            array.some(post2, function(b, j) {
                if (match2(a, b)) {
                    found = j;
                    Mfinal[a.diffId] = b;
                    Mfinal[b.diffId] = a;
                    a.matched = true;
                    b.matched = true;
                    return true;
                }
                return false;
            });
            post2.splice(found, 1);
        });
        for (q in Mfinal)
            console.log(q + "="+Mfinal[q].diffId);
        return Mfinal;
    }

    // Myers's LCS algorithm [Mye86]. Runs in O(N*D) where N=|S1|+|S2| and D=N-2 * |LCS(S1, S2)|
    // TODO implement me
    function LCS_notyet(s1, s2, cmp) {

    }

    /* Non-optimal LCS algorithm available in every basic algorithms textbook. Runs in O(|S1| * |S2|).
       Comparison callback test equality and should return true on when two elements are equal for
       this LCS computation.

       Important note: the LCS returned is set to references of `s1`, not of `s2`! */
    // TODO do away with me!
    function LCS(s1, s2, equal) {
        function longest(i, j) {
            var arr;
            if (0 == i || 0 == j)
                return [];
            else if (equal(s1[i-1], s2[j-1])) {
                arr = longest(i-1, j-1);
                arr.push(s1[i-1]);
                return arr;
            }
            else if (mem[(i-1)+","+j] > mem[i+","+(j-1)])
                return longest(i-1, j);
            else
                return longest(i, j-1);
        }
        var n1, n2, i, j;
        var mem;

        n1 = s1.length;
        n2 = s2.length;
        mem = {};

        for (i = 0; i <= n1; ++i) {
            for (j = 0; j <= n2; ++j) {
                if (0 == i || 0 == j)
                    mem[i+","+j] = 0;
                else if (equal(s1[i-1], s2[j-1]))
                    mem[i+","+j] = mem[(i-1)+","+(j-1)] + 1;
                else
                    mem[i+","+j] = Math.max(mem[(i-1)+","+j], mem[i+","+(j-1)]);
            }
        }
        return longest(n1, n2);
    }

    // TODO doc
    // A big assumption is that root(t1) == root(t2).
    EditorTree.treeDiff = function(t1, t2, map) {
        t11 = t1;
        t21=t2;
        DEBUG1?console.log(t1.toHTML()):null;
        DEBUG1?console.log(t2.toHTML()):null;
        var M, Mp, E;
        var seed, counter;
        var tmp;

        // If the roots are not equal, add another level with identical roots.
        if (!t1.equalsDeep(t2)) {
            console.error("heads not equal");
            return false;
        }

        // TODO should inline?
        function doMatch(x, y) {
            // Checking .matched might save a lookup of Mp which might be costly (just a guess).
            return x.matched && y.matched && Mp[x.diffId].diffId == y.diffId;
        }
        function alignChildren(w, x) {
            var S1, S2, S2;
            array.forEach(w.children, function(at, i) {
                    at.inOrder = false;
            });
            array.forEach(x.children, function(at, i) {
                    at.inOrder = false;
            });
            /* S1 is children of w whose partners are children of x.
               S2 is children of x whose partners are children of w. */
            S1 = [];
            S2 = [];
            array.forEach(w.children, function(at, i) {
                var partner = Mp[at.diffId];
                if (partner && partner.parent == x)
                    S1.push(at);
            });
            array.forEach(x.children, function(at, i) {
                var partner = Mp[at.diffId];
                if (partner && partner.parent == w)
                    S2.push(at);
            });

            // Remember, S contains elements from `S1`, not `S2`.
            S = LCS(S1, S2, doMatch); // iff (a,b) \in Mp
            array.forEach(S, function(at, i) {
                // For each (a,b) in S, mark nodes as in order.
                at.inOrder = true;
                Mp[at.diffId].inOrder = true;
            });

            // Careful...O(n^2).
            /*array.forEach(S1, function(a, i) {
                array.forEach(S2, function(b, j) {
                    var k;
                    if (a.matched && b.equalsDeep(Mp[a.diffId]) && treeNodeIndexOf(S, a, EditorTree.compare) < 0) {
                        k = findPos(b);
                        E.push({ty:"move", args:{x:a,y:w,k:k}});
                        EditorTree.applyMov(a, w, k);
                        DEBUG1?console.log(t11.toString()):null;
                        a.inOrder = true;
                        b.inOrder = true;
                    }
                });
            });*/
            // Better way than above O(n^2):
            array.forEach(S1, function(a, i) {
                var b, k, oldK;
                // The `&&` sequence point below ensures `b` is correctly set.
                if (a.matched && (b = Mp[a.diffId]) && b.parent == x && !b.inOrder) {
                    k = findPos(b);
                    oldK = w.children.indexOf(a);
                    if (oldK<0)
                        console.error("idx bad applyMov");
                    if (a.parent == w && k > oldK) // Minus one for 
                        --k;
                    E.push({ty:"move", args:{oldParent:a.parent.id,x:a.id, y:w.id, k:k, oldK:oldK}});
                    EditorTree.applyMov(a, w, k, oldK);
                    if (DEBUG1){t11.sanityCheck();t21.sanityCheck();}
                    a.inOrder = true;
                    b.inOrder = true;
                    DEBUG1?console.log(t11.toString(0,MMP)):null;
                }
            });
        }
        // Assumes !isRoot(x).
        function findPos(x) { // x \in T_2.
            var y, w, tmp, v, idx, u;
            var siblings;

            y = x.parent;
            w = Mp[x.diffId];
            siblings = y.children;

            // Find leftmost "in order" node.
            tmp = false;
            for (i in siblings) {
                checkPoison(siblings[i].inOrder);
                if (siblings[i].inOrder) {
                    tmp = siblings[i];
                    break;
                }
            }
            if (tmp && x.diffId == tmp.diffId) {
                console.log("findPos=0");
                return 0;
            }

            /* Find v \in T_2 where v is the rightmost sibling of x that is to the left
               of x and is marked "in order." */
            idx = array.indexOf(siblings, x) - 1;
            for ( ; idx >= 0 && checkPoison(siblings[idx].inOrder) &&
                    !siblings[idx].inOrder; --idx)
                ;
            if (idx < 0) {
                return 0;
            }
            v = siblings[idx]; // ??? what if idx < 0?
            u = Mp[v.diffId];
            checkPoison(u.inOrder);
            if (!u.inOrder)
                console.error("!u.inOrder");
            if (!u.parent)
                console.error("!u.parent");
            return array.indexOf(u.parent.children, u) + 1;
        }

        // Prepare the two trees for a diff. Each node must have a globally unique id (diffId).
        globalIdCounter = -1; // This will be set to the max + 1 of t1's node's ids.
        seed = 0;
        counter = 0;
        t1.levelOrder(function(at) {
            at.diffId = seed++;
            at.matched = false;
            at.inOrder = 0xdeadbeef;
            if (at.id > globalIdCounter)
                globalIdCounter = at.id;
        });
        ++globalIdCounter;
        counter = 0;
        t2.levelOrder(function(at) {
            at.diffId = seed++;
            at.matched = false;
            at.inOrder = 0xdeadbeef;
        });
        if (1) {
            M = getPartialMatches(t1, t2);
            DEBUG1?console.log("M1=",(function(){var x=0; for (i in M){console.log(i+"="+M[i]);++x;}return x;})()):null;
        }else{
            M = changeDistillingMatch(t1, t2);
            DEBUG1?console.log("M2=",(function(){var x=0; for (i in M){console.log(i+"="+M[i]);++x;}return x;})()):null;
        }
        Mp = {};
        MMP = Mp;
        for (tmp in M)
            Mp[tmp] = M[tmp];
        E = [];
        DEBUG1?console.log(t1.toString(0,Mp)):null;
        DEBUG1?console.log(t2.toString(0,Mp)):null;

        // Insert, update, align, and move phases all at once:
        t2.levelOrder(function(x) {
            var y, z, w, v, pid;
            var k, oldK, newId;

            y = x.parent;
            w = Mp[x.diffId];
            if (!w) {
                DEBUG1?console.log("case 1"):null;
                k = findPos(x);
                z = Mp[y.diffId]; // TODO always exists? what?
                newId = globalIdCounter++;
                E.push({ty:"insert", args:{data:x.data(), x:x.id, y:z.id, k:k, newId:newId}});
                w = EditorTree.applyIns(x, z, k, newId);
                map ? (map[w.id] = w) : null;
                    if (DEBUG1){t11.sanityCheck();t21.sanityCheck();}
                x.inOrder = true;
                w.inOrder = true;
                x.matched = true;
                w.matched = true;
                w.diffId = seed++;
                Mp[w.diffId] = x;
                Mp[x.diffId] = w;
                DEBUG1?console.log(t11.toString(0,Mp)):null;
            } else if (null !== y) { // !isRoot(x) and x has a partner.
                DEBUG1?console.log("case 2"):null;
                v = w.parent;
                if (w.getValue() != x.getValue()) {
                    DEBUG1?console.warn("case 2a"):null;
                    // args.parent and args.k are specifically for the RichTextEditor.
                    if (w.parent) {
                        pid = w.parent.id;
                        k = w.parent.children.indexOf(w);
                    } else {
                        pid = -1;
                        k = -1;
                    }
                    E.push({ty:"update", args:{pid:pid, x:w.id, k:k, val:x.data()}});
                    EditorTree.applyUpd(w, x);
                    if (DEBUG1){t11.sanityCheck();t21.sanityCheck();}
                    DEBUG1?console.log(t11.toString(0,Mp)):null;
                }
                if (!doMatch(y, v)) {
                    z = Mp[y.diffId]; // TODO always exists? what?
                    DEBUG1?console.warn("case 2b"):null;
                    k = findPos(x);
                    oldK = w.parent.children.indexOf(w);
                    if (oldK < 0)
                        console.error("idx bad applyMov");
                    if (w.parent == z && k > oldK)
                        --k;
                    E.push({ty:"move", args:{oldParent:w.parent.id,x:w.id, y:z.id, k:k, oldK:oldK}});
                    EditorTree.applyMov(w, z, k, oldK);
                    w.inOrder = true;
                    x.inOrder = true;
                    if (DEBUG1){t11.sanityCheck();t21.sanityCheck();}
                    DEBUG1?console.log(t11.toString(0,Mp)):null;
                }
            } else {
                DEBUG1?console.log("case 3"):null;
            }
            alignChildren(w, x);
                DEBUG1?console.log(t11.toString(0,Mp)):null;
        });
        DEBUG1?console.log("OK\n\n\nready\n\n"+t1.toString(0,Mp)+"\n"+t2.toString(0,Mp)):null;
        // Delete phase.
        var postOrderList = [];
        getPostOrderList = function(w) {
            if (!Mp[w.diffId]) {
                postOrderList.push(w);
            }
        };
        t1.postOrder(getPostOrderList);
        array.forEach(postOrderList, function(w, i) {
            var pos;
            if (!Mp[w.diffId]) {
                pos = w.parent.children.indexOf(w);
                if (pos<0) // TODO remove
                    console.error("idx bad applyDel!",siblings.indexOf(x));
                E.push({ty:"delete", args:{parentId:w.parent.id,k:pos}});
                EditorTree.applyDel(w, pos);
                map ? (delete map[w.id]) : null;
                    if (DEBUG1){t11.sanityCheck();t21.sanityCheck();}
                DEBUG1?console.log(t11.toString(0, MMP)):null;
            }
        });
        return E;
    };

    //tree1 = createTreeFromElement("ok1");
    // New editor deals with 7% of the "nodes" the old editor did.
    //console.log(dom.byId("ok1").innerHTML.length); //17432
    //console.log(tree1.levelOrderArray().length); // 1262
    /*
    var Tree = function(val, p) {
        this.val = val;
        this.p = p;
        this.children = [];
        if (null === p)
            this.depth = 0;
        else
            this.depth = p.depth + 1;
    };
    Tree.prototype.push = function(val) {
        var t = new Tree(val, this);
        this.children.push(t);
        return t;
    };
    Tree.prototype.print = function(depth) {
        if (undefined === depth || null === depth)
            depth = 0;
        console.log(tabs(depth) + this.val);
        ++depth;
        array.forEach(this.children, function(at, i) {
            at.print(depth);
        });
    };
    // Iterative post order??? TODO
    Tree.prototype.post = function(cb) {
        array.forEach(this.children, function(at, i) {
            at.post(cb);
        });
        cb(this);
    };
    Tree.prototype.special = function() {
        var q, at, depths, i;
        q = [this];
        depths = [];
        while (q.length > 0) {
            at = q.shift();
            if (at.depth > depths.length) { console.error("depths broken");
            } else if (at.depth == depths.length) {
                depths.push([]);
            }
            depths[at.depth].push(at);
            array.forEach(at.children, function(child, i) {
                q.push(child);
            });
        }
        q = [];
        for (i = depths.length - 1; i >= 0; --i) {
            array.forEach(depths[i], function(at, i) {
                q.push(at);
            });
        }
        return q;
    };

    var t = new Tree(0, null);
    var tmp = t.push(1);
    tmp.push(5);
    tmp.push(6);
    tmp.push(7);
    tmp.push(8);
    tmp = t.push(2);
    tmp.push(9);
    tmp.push(10);
    tmp.push(11);
    tmp.push(12);
    tmp = t.push(3);
    tmp.push(13);
    tmp.push(14);
    tmp.push(15);
    tmp.push(16);
    tmp = t.push(4);
    tmp.push(17);
    tmp.push(18);
    tmp.push(19);
    tmp.push(20);
    var A = t.special();
    var S = "";
    array.forEach(A, function(x) { S += x.val +","; });
    console.log(S);*/
    return EditorTree;
});

