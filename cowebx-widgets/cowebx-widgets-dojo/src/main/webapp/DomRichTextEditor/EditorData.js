
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

		/* This requires knowledge about the internals of rangy v1.2.2.
		   Eventually, we need to extend rangy's API, or use a custom
		   range/selection API. */
		this.lrangyHTML = '<span id="1selectionBoundary" ' + 
			'style="line-height: 0; display: none; ">\ufeff</span>';
		this.rrangyHTML = '<span id="2selectionBoundary" ' + 
			'style="line-height: 0; display: none; ">\ufeff</span>';
		this.lrangyId = "1selectionBoundary";
		this.rrangyId = "2selectionBoundary";

	};
	var proto = EditorData.prototype;
	proto.setSyncQueue = function(q) { this.syncQueue = q; };
	proto.setDomTreeMap = function(m) { this.domTree_map = m; };
	proto.setDomTree = function(t) {
		this.domTree = t;
		this._cursorHTML = this.domTree.toHTML();
	};

	proto.generateCursorHTML = function() {
		this._cursorHTML = this.domTree.toHTML();
		/* We don't want the outermost <div>. The assumption is that domTree
		   always has the outer <div> elements. */
		this._cursorHTML = this._cursorHTML.substring(5,
				this._cursorHTML.length - 6);
	};

	/* Adds the cursor <span> tags to local-html and returns the cursor-html
	   string. On error, false is returned. */
	proto.addLocalCursorSpan = function() {
		function addSpan(pos, s) {
			value = value.substring(0, pos) + s + value.substring(pos);
		}

		var sel = rangy.saveSelection();
		var value = this.getLocalHTML();
		var spans = {};
		if (!this._findRangy(value, spans)) {
			rangy.restoreSelection(sel);
			// At the very least, place the cursor at the beginning.
			addSpan(0, this.rcursorHTML);
			return value;
		}
		value = this._removeRangy(value, spans);

		if (spans.firstSpan)
			addSpan(spans.firstSpan.pos, this.lcursorHTML);
		if (spans.secondSpan)
			addSpan(spans.secondSpan.pos, this.rcursorHTML);

		rangy.restoreSelection(sel);
		return value;
	};

	proto.placeLocalCursor = function() {
		var lpos = this.myCursorPosition("l");
		var rpos = this.myCursorPosition("r");
		var sel = rangy.saveSelection();
		var value = this.getLocalHTML();
		var spans = {};
		this._findRangy(value, spans);
		value = this._removeRangy(value, spans);
		console.log("rpos="+rpos+","+this._cursorHTML);

		var rangeInfo = {
			collapsed : true,
			markerId : this.rrangyId
		};
		/* Must do right cursor first, then left cursor. */
		value = value.substring(0, rpos) + this.rrangyHTML +
			value.substring(rpos);
		if (lpos >= 0) {
			rangeInfo.collapsed = false;
			rangeInfo.startMarkerId = this.lrangyId;
			rangeInfo.endMarkerId = this.lrangyId;
			delete rangeInfo.markerId;
			rangeIn.backwards = false; // TODO support backwards...
			value = value.substring(0, lpos) + this.lrangyHTML +
				value.substring(lpos);
		}
		this.textarea.innerHTML = value;
		
		/* More internal rangy v1.2.2 hacks. */
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
		this.lcursorHTML = '<span id="cursorpos-l-' + unique + '"></span>';
		this.rcursorHTML = '<span id="cursorpos-r-' + unique + '"></span>';
	};

	/* Returns -1 if the cursor span doesn't exist, otherwise the position. */
	proto.myCursorPosition = function(which) {
		var s;
		if ("l" === which) {
			return this.getCursorHTML().indexOf(this.lcursorHTML);
		} else {
			var idx = this.getCursorHTML().indexOf(this.rcursorHTML);
			if (idx >= 0)
				return idx;
			else
				return 0;
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
		var rpos = this.myCursorPosition("r");
		/* First remove right span, then left. */
		value = value.substring(0, rpos) +
			value.substring(rpos + this.rcursorHTML.length);
		if (lpos >= 0) {
			value = value.substring(0, lpos) +
				value.substring(lpos + this.lcursorHTML.length);
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
		// Non-collapsed selection?
		var start = raw.indexOf(search1);
		if (-1 == start)
			start = raw.indexOf(search1a);
		if (-1 != start) {
			end = raw.indexOf(search2);
			if (-1 == end)
				end = raw.indexOf(search2a);
			if (-1 == end)
				return false;

			// Guaranteed both spans exist.
			if (start > end) {
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
		} else {
			// Collapsed selection.
			end = raw.indexOf(search2);
			if (-1 == end)
				end = raw.indexOf(search2a);
			if (-1 == end) {
				return false;
			}
			// Guaranteed only second span exists.
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
			// Order is important below!
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

