
/**
  * Defines an encapsulated form of the rich text editor content. The primary
  * purpose is to provide an API that can easily remember cursor range selection
  * of the local user and all remote users.
  */

define([
	"./lib/rangy/uncompressed/rangy-core",
	"./lib/rangy/uncompressed/rangy-selectionsaverestore",
], function() {

	rangy.init();

	/* I think WebKit inserts a weird character inside the span. */
	var markerLength = (dojo.isWebKit) ? 78 : 77;

	/* Encapsulates the editor content. This object can be considered in four
	   different forms (the form names will be used throughout comments below)
	     - cursor-tree: Dom tree.
		 - cursor-html: HTML string with hidden <span> tags to uniquely identify
		   each client's cursor position.
		 - local-html: Like cursor-html, except the local cursor <span> is
		   removed.
		 - current-html: The HTML inside the editor - similar to local-html
		   since local cursor <span> is not present, but other <span>s are.
	 */
	var EditorData = function(textarea) {
		this.textarea = textarea;

		this.syncQueue      = [];
		/* The following defines the internal structure of the editor data as
		   a tree (cursor-tree form). */
		this.domTree        = null;
		this.domTree_map    = null;

		this._cursorHTML = "";

		this.uniqueId = -1;
		this.lcursorHTML = "";
		this.rcursorHTML = "";

		/* This requires knowledge about the internals of rangy uncompressed
		   v1.2.2. Eventually, we need to extend rangy's API, or use a custom
		   range/selection API. */
		this.lrangyHTML = '<span id="1selectionBoundary" ' + 
			'style="line-height: 0; display: none; ">\ufeff</span>';
		this.rrangyHTML = '<span id="2selectionBoundary" ' + 
			'style="line-height: 0; display: none; ">\ufeff</span>';
		this.lrangyId = "1selectionBoundary";
		this.rrangyId = "2selectionBoundary";

		this._cacheLpos = this._cacheRpos = false;

	};
	var proto = EditorData.prototype;
	proto.setSyncQueue = function(q) { this.syncQueue = q; };
	proto.setDomTreeMap = function(m) { this.domTree_map = m; };
	proto.setDomTree = function(t, genMap) {
		this.domTree = t;
		/* Default is to generate map unless explicitly set to false. */
		if (false !== genMap)
			this.generateDomTreeMap();
		this.generateCursorHTML("1");
	};

	proto.generateCursorHTML = function(a) {
		this._cursorHTML = this.domTree.toHTML();
		if (this._cursorHTML.indexOf("<<") >= 0) {
			debugger;
		}
		/* We don't want the outermost <div>. The assumption is that domTree
		   always has the outer <div> elements. */
		this._cursorHTML = this._cursorHTML.substring(5,
				this._cursorHTML.length - 6);
		/* Invalidate cursor position index caches. */
		this._cacheLpos = this._cacheRpos = false;
	};

	/* Adds the cursor <span> tags to local-html and returns the cursor-html
	   string. 

	   If rangy is unable to find cursors in the textarea... TODO
	  */
	proto.addLocalCursorSpan = function() {
		function addSpan(pos, s) {
			value = value.substring(0, pos) + s + value.substring(pos);
		}

		var sel = rangy.saveSelection();
		var value = this.getLocalHTML();
		var spans = {};
		if (!this._findRangy(value, spans)) {
			rangy.restoreSelection(sel);
			/* Since the user doesn't have a selection in the editor, see if
			   local cursor data exists in cursor-html. If not, add the cursor
			   at the beginning of the text and return that. */
			var rpos = this.getCursorHTML().indexOf(this.rcursorHTML);
			if (rpos >= 0) {
				return this.getCursorHTML();
			} else {
				addSpan(0, this.rcursorHTML);
				return value;
			}
		}
		value = this._removeRangy(value, spans);

		/* Order is important below! */
		addSpan(spans.secondSpan.pos, this.rcursorHTML);
		if (spans.firstSpan)
			addSpan(spans.firstSpan.pos, this.lcursorHTML);

		rangy.restoreSelection(sel);
		return value;
	};

	/* This function relies on internal knowledge of rangy uncompressed v1.2.2.
	   Any other version of rangy is not guaranteed to work...
	   */
	proto.placeLocalCursor = function() {
		var lpos = this.myCursorPosition("l");
		var rpos = this.myCursorPosition("r");
		var sel = rangy.saveSelection();
		var value = this.getLocalHTML();
		var spans = {};
		this._findRangy(value, spans);
		value = this._removeRangy(value, spans);

		var rangeInfo = {
			collapsed : true,
			markerId : this.rrangyId
		};

		var backwards = false;
		if (lpos >= 0) {
			/* Is the range backwards? */
			if (lpos > rpos) {
				backwards = true;
				var tmp = lpos;
				lpos = rpos;
				rpos = tmp;
				console.log("is backwards ",lpos, rpos);
			}
		}

		/* Must do right cursor first, then left cursor. */
		value = value.substring(0, rpos) + this.rrangyHTML +
			value.substring(rpos);
		if (lpos >= 0) {
			rangeInfo.collapsed = false;
			rangeInfo.startMarkerId = this.lrangyId;
			rangeInfo.endMarkerId = this.rrangyId;
			delete rangeInfo.markerId;
			rangeInfo.backwards = backwards;
			value = value.substring(0, lpos) + this.lrangyHTML +
				value.substring(lpos);
		}
		this.textarea.innerHTML = value;
		if (this.textarea.innerHTML != value)
			debugger;
		
		/* More internal rangy uncompressed v1.2.2 hacks. */
		var rangeInfos = sel.rangeInfos;
		var idx = -1;
		for (var i in rangeInfos) {
			if ("2selectionBoundary" == rangeInfos[i].endMarkerId ||
					"2selectionBoundary" == rangeInfos[i].markerId) {
				idx = i;
				break;
			}
		}
		if (-1 === idx) {
			rangeInfos.push(rangeInfo);
		} else {
			rangeInfos[idx] = rangeInfo;
		}

		rangy.restoreSelection(sel);
	};

	proto.generateDomTreeMap = function() {
		this.domTree_map = {};
		var map = this.domTree_map;
		map[null]  = null;
		this.domTree.levelOrder(function(at) {
			map[at.id] = at;
		});
	};

	proto.toHTML = function() {
		/* We don't want the outermost <div>. The assumption is that domTree
		   always has the outer <div> elements. */
		var HTML = this.domTree.toHTML();
		return HTML.substring(5, HTML.length - 6);
	};

	/* Unique ID should be >= 0. */
	proto.setUniqueId = function(unique) {
		this.uniqueId = unique;
		this.lcursorHTML = '<span id="cursorpos-l-' +unique + '"></span>';
		this.rcursorHTML = '<span id="cursorpos-r-' +unique + '"></span>';
	};

	/* Returns -1 if the cursor span doesn't exist, otherwise the position. */
	proto.myCursorPosition = function(which, mustExist) {
		if (undefined === mustExist)
			mustExist = false;
		if ("l" === which) {
			if (false !== this._cacheLpos)
				return this._cacheLpos;
			this._cacheLpos = this.getCursorHTML().indexOf(this.lcursorHTML);
			return this._cacheLpos;
		} else {
			if (false !== this._cacheRpos && !mustExist)
				return this._cacheRpos;
			/* Must subtract left cursor string length if it exists. */
			var lpos = this.myCursorPosition("l");
			this._cacheRpos = this.getCursorHTML().indexOf(this.rcursorHTML);
			/* If lpos >= 0, then the right cursor must exist. */
			if (lpos >= 0)
				this._cacheRpos -= this.lcursorHTML.length;
			else if (this._cacheRpos < 0) {
				if (mustExist)
					return -1;
				this._cacheRpos = 0;
			}
			return this._cacheRpos;
		}
	}

	proto.cursorExists = function(id, which) {
		// TODO
		throw Error("TODO not yet");
	}

	proto.getCursorHTML = function() {
		return this._cursorHTML;
	};

	proto.generateLocalHTML = function() {
		var value = this.getCursorHTML();
		var lpos = this.myCursorPosition("l");
		var rpos = this.myCursorPosition("r", true);
		/* First remove right span, then left. */
		if (lpos >= 0) {
			value = value.substring(0, lpos) +
				value.substring(lpos + this.lcursorHTML.length);
		}
		if (rpos >= 0) {
			value = value.substring(0, rpos) +
				value.substring(rpos + this.rcursorHTML.length);
		}
		return value;
	};

	proto.getLocalHTML = function() {
		return this.textarea.innerHTML;
	};

	/* Finds rangy's cursor span elements. If there are two cursor spans, the
	   position of the second span is set as if the first span was not there. */
	proto._findRangy = function(raw, spans) {
		/* The Rangy span will be one of search# or search#a (or neither). */
		var search1 = '<span style="line-height: 0; display: none;" id="1sel';
		var search1a = '<span id="1sel';
		var search2 = '<span style="line-height: 0; display: none;" id="2sel';
		var search2a = '<span id="2sel';
		var start, end;

		spans.firstSpan = null;
		spans.secondSpan = null;
		/* Non-collapsed selection? */
		var start = raw.indexOf(search1);
		if (-1 == start)
			start = raw.indexOf(search1a);
		if (-1 != start) {
			end = raw.indexOf(search2);
			if (-1 == end)
				end = raw.indexOf(search2a);
			if (-1 == end) {
				return false;
			}

			/* Guaranteed both spans exist. */
			var backwards = false;
			if (start > end) {
				backwards = true;
				var tmp = end;
				end = start;
				start = tmp;
			}
			spans.firstSpan = {
				pos : start,
				text : raw.substring(start, start + markerLength),
			};
			spans.secondSpan = {
				pos : end - markerLength,
				text : raw.substring(end, end + markerLength),
			};
			if (backwards) {
				tmp = spans.firstSpan;
				spans.firstSpan = spans.secondSpan;
				spans.secondSpan = tmp;
				console.log("BACK ",spans.firstSpan.pos,spans.secondSpan.pos);
			}
		} else {
			/* Collapsed selection. */
			end = raw.indexOf(search2);
			if (-1 == end)
				end = raw.indexOf(search2a);
			if (-1 == end) {
				return false;
			}
			/* Guaranteed only second span exists. */
			spans.secondSpan = {
				pos : end,
				text : raw.substring(end, end + markerLength),
			};
		}
		return true;
	};

	/**
	  * Remove rangy spans and keep track of the span HTML text and positions.
	  * @param raw cursor-html form
	  * @param spans will be filled with cursor information
	  * @return the HTML with rangy spans removed (if they existed)
	  */
	proto._removeRangy = function(raw, spans) {
		var start, end;
		if (spans.firstSpan) {
			start = spans.firstSpan.pos;
			end = spans.secondSpan.pos;
			/* Order is important below! */
			raw = raw.substring(0, start) +
				raw.substring(start + markerLength);
			raw = raw.substring(0, end) +
				raw.substring(end + markerLength);
		} else if (spans.secondSpan) {
			end = spans.secondSpan.pos;
			raw = raw.substring(0, end) +
				raw.substring(end + markerLength);
		}
		return raw;
	};

	return EditorData;

});

