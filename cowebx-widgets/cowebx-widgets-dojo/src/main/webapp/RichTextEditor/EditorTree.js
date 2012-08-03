
/**
  * TreeTools.js contains two major components:
  *   1) Tools for creating and working with a DOM element using a custom tree.
  *   2) A tree-based diff algorithm that created a sequence of operations to
  *      transform one tree to another.
  *
  * The two components logically should be separate, although in this file they
  * are tightly coupled. Future work should loosen (by a large amount) this
  * coupling so that generic applications can compare and diff tree structures.
  *
  */

var DEBUG1 = false;

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
	"./lib/diff_match_patch"
], function(dom, array) {

	// Internet Explorer doesn't have Node.
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

	var differ = new diff_match_patch();

	// Global variables are fine since JavaScript is reentrant.
	var globalIdCounter = null;

	/* Essentially there are two types of nodes:
		 1. Internal nodes represent a JavaScript DomNode.
		 2. Leaf nodes contain the text of the HTML tag.
	   There is an exception - empty HTML elements (ex: "<b></b>") will be a
	   leaf node. Use the nodeType member to determime the type of node
	   (either Node.ELEMENT_NODE or Node.TEXT_NODE).

	   The constructor simple sets all members to null. `parent` is null only
	   for the root.
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

	var proto = EditorTree.prototype;

	proto.flatten = function() {
		var str = "";
		this.prePostOrder(function(at) {
			if (Node.TEXT_NODE == at.nodeType) {
				str += at.text + "\n";
			} else if (Node.ELEMENT_NODE == at.nodeType) {
				str += at.beginTag + "\n";
				if (null !== at.text)
					str += at.text + "\n";
			}
		}, function(at) {
			if (Node.ELEMENT_NODE == at.nodeType) {
				str += at.endTag + "\n";
			}
		});
		return str;
	}

	proto.data =  function() {
		return {
			beginTag    : this.beginTag,
			endTag      : this.endTag,
			text        : this.text,
			nodeType    : this.nodeType
		};
	};

	/*  */
	proto.sanityCheck = function() {
		var ret = true;
		if (this.parent && !this.parent.children) {
			console.error("sanity 1 failed");
			return false;
		}
		if (this.parent && this.parent.children.indexOf(this) < 0) {
			console.error("sanity 2 failed");
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
		function tabs(n) {
			return "                                        ".substring(0, n*4);
		}
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
		/* JavaScript's += is apparently really fast, so no need to worry
		   about large strings. */
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
	proto.prePostOrder = function(beginCb, endCb) {
		beginCb(this);
		array.forEach(this.children, function(at, i) {
			at.prePostOrder(beginCb, endCb);
		});
		endCb(this);
	};

	// TODO make iterative
	proto.postOrder = function(cb) {
		array.forEach(this.children, function(at, i) {
			at.postOrder(cb);
		});
		cb(this);
	};

	/* Performs a level order traversal where the levels are visited in
	   ascending order. Ex:
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

	proto.copyFrom = function(o) {
		this.beginTag = o.beginTag;
		this.endTag = o.endTag;
		this.text = o.text;
		this.nodeType = o.nodeType;
	};

	function similarity(a, b) {
		var dist, max, diffs;
		max = Math.max(a.length, b.length);
		if (0 == max)
			return 1.0;
		if (0 == Math.min(a.length, b.length))
			return 1.0;
		/* Note that levenshtein distance is more accurate for calculating
		   similarity, but it is much slower than diff-match-patch.
		   */
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
		return 1.0 - dist / max;
	}

	// For debugging.
	function checkAll() {
		for (var i in arguments) {
			if (!arguments[i].sanityCheck())
				return false;
		}
		return true;
	}
	// y - parent, k - child position, x - data to copy.
	// Only insert leaves.
	EditorTree.applyIns = function(x, y, k, newId) {
		if (!checkAll(y)) {
			console.log("applyIns sanitycheck", x,y,k,newId);
		}
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
		if (!checkAll(y,toAdd)) {
			console.log("applyIns sanitycheck", x,y,k,newId);
		}
		return toAdd;
	};

	EditorTree.applyUpd = function(x, val) {
		x.copyFrom(val);
	};

	// Assumes x is a leaf node.
	EditorTree.applyDel = function(x, k) {
		if (!checkAll(x)) {
			console.log("applyDeli sanitycheck", x,k);
		}
		var siblings, p;
		p = x.parent;
		siblings = p.children;
		if (x.children)
			console.error("applyDEL not leaf");
		siblings.splice(k, 1);
		if (0 == siblings.length)
			p.children = null;
		if (!checkAll(p)) {
			console.log("applyDel sanitycheck", x,k);
		}
	};

	EditorTree.applyMov = function(x, y, k, oldK) {
		if (!checkAll(x,y)) {
			console.log("applyMov sanitycheck", x,y,k,oldK);
		}
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
		if (!checkAll(x,y)) {
			console.log("applyMov sanitycheck", x,y,k,oldK);
		}
	};

	/* Creates a custom tree representation of a DomNode. The structure of the custom
	   tree nodes is:
		 * tag - Name of the node element's tag. Ex: "b"
		 * attributes - Raw string of the node's attributes. Ex: " class='big'"
		 * children - Array of nodes.
	   */
	// TODO should I use a comprehensive list? might not be as fast...
	/*var emptyTagList = ["br", "hr", "img", "link", "input", "area", "param",
	  "col", "meta", "base", "embed"]; */
	var emptyTagList = ["br", "hr", "img"];
	EditorTree.createTreeFromElement = function(id) {
		/* Some versions of Firefox don't support node.outerHTML, so use this
		   workaround. It probably isn't particularly fast, though. Firefox 11
		   began supporting outerHTML natively. */
		function getOuterHTML(node) {
			if (node.outerHTML)
				return node.outerHTML;
			var div = document.createElement("div");
			div.appendChild(node.cloneNode(true));
			return div.innerHTML;
		}
		function extractHTML(domNode, treeNode) {
			/* Extracts the first tag and its contents. The results are stored
			   in `node`.
			   Example: extractHTML("<b class='big'><u>hello</u></b>", tree)
			   sets tree.beginTag = "<b class='big'>' and tree.endTag = "</b>".

			   This function makes assumptions about the structure of the raw
			   outerHTML string.

			   Returns true if this node is a pseudo leaf - a DOM node with a
			   single TEXT_NODE child, false otherwise.
			   */
			var end, outer, tagLen, innerLen, child;
			outer = getOuterHTML(domNode);
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

	// Algorithm `Match` from http://ilpubs.stanford.edu:8090/115/1/1995-46.pdf
	// TODO there is a faster match algorithm (fastMatch, changeDistillingMatch)
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
				if (!at.matched && equal1(node, at)) {
					idx = i;
					return true;
				}
				return false;
			});
			return idx;
		}
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
					t2List.splice(idx, 1);
				}
			}
		});
		return M;
	}

	/* Improved version of getPartialMatches. See http://ilpubs.stanford.edu:8090/115/1/1995-46.pdf 
	   TODO not yet implemented. */
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

	/* A better version of fastMatch or getPartialMatches. See
       http://www.ifi.uzh.ch/pax/uploads/pdf/publication/704/fluri-tse2007.pdf
	   TODO as yet unimplemented/untested */
	function changeDistillingMatch(t1, t2) {
		var fThreshold = .6; // TODO tune this?
		var tThreshold = .6;
		var tThresholdExtra = .8;
		function match1(x, y) {
			// Return false if no match, otherwise return the value similarity.
			var sim = similarity(x.getValue(), y.getValue());
			if (x.getLabel() == y.getLabel() && sim >= fThreshold)
				return sim;
			else
				return false;
		}
		function match2(x, y) {
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
			array.forEach(leaves2, function(b) {
				var sim = match1(a, b);
				if (false !== sim) {
					Mtmp.push({a:a, b:b, sim:sim});
					return true;
				}
				return false;
			});
		});
		// Now, sort the leaves based on sim. TODO do this online with a [balanced] BST (or dont use insertion sort).
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
	// TODO replace with Myer's LCS
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

	/**
	  * The assumption is that t1 and t2 share identical roots. If not, the caller should add another level
	  * by creating new roots for each tree that are identical.
	  *
	  * Based on http://ilpubs.stanford.edu:8090/115/1/1995-46.pdf
	 */
	EditorTree.treeDiff = function(t1, t2, map) {
		/* M is for the initial matching set, Mp is the matching set as the algorithm creates an edit script,
		   E is the edit script itself. */
		var M, Mp, E;
		var seed, counter;
		var tmp;

		// If the roots are not equal, add another level with identical roots.
		if (t1.beginTag != t2.beginTag || t1.text != t2.text || t1.depth != t2.depth) {
			console.error("heads not equal");
			return false;
		}

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

			array.forEach(S1, function(a, i) {
				var b, k, oldK;
				// The `&&` sequence point below ensures `b` is correctly set.
				if (a.matched && (b = Mp[a.diffId]) && b.parent == x && !b.inOrder) {
					k = findPos(b);
					oldK = w.children.indexOf(a);
					if (oldK<0)
						console.error("idx bad applyMov");
					if (a.parent == w && k > oldK)
						--k;
					E.push({ty:"move", args:{oldParent:a.parent.id,x:a.id, y:w.id, k:k, oldK:oldK}});
					EditorTree.applyMov(a, w, k, oldK);
					a.inOrder = true;
					b.inOrder = true;
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
		/* getPartialMatches is a very naive matching algorithm. changeDistillingMatch is a (as yet unimplemented) better
		   matching algorith that should improve the performance of treeDiff. */
		M = getPartialMatches(t1, t2);
		Mp = {};
		for (tmp in M)
			Mp[tmp] = M[tmp];
		E = [];

		// Insert, update, align, and move phases all at once:
		t2.levelOrder(function(x) {
			var y, z, w, v, pid;
			var k, oldK, newId;

			y = x.parent;
			w = Mp[x.diffId];
			if (!w) {
				k = findPos(x);
				z = Mp[y.diffId];
				newId = globalIdCounter++;
				E.push({ty:"insert", args:{data:x.data(), x:x.id, y:z.id, k:k, newId:newId}});
				w = EditorTree.applyIns(x, z, k, newId);
				map ? (map[w.id] = w) : null;
				x.inOrder = true;
				w.inOrder = true;
				x.matched = true;
				w.matched = true;
				w.diffId = seed++;
				Mp[w.diffId] = x;
				Mp[x.diffId] = w;
			} else if (null !== y) { // !isRoot(x) and x has a partner.
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
				}
				if (!doMatch(y, v)) {
					z = Mp[y.diffId];
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
				}
			}
			alignChildren(w, x);
		});
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
				E.push({ty:"delete", args:{parentId:w.parent.id,k:pos}});
				EditorTree.applyDel(w, pos);
				map ? (delete map[w.id]) : null;
			}
		});
		return E;
	};

	return EditorTree;
});

