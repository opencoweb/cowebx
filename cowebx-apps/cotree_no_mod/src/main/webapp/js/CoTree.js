
define(["dojo/_base/array"], function(array)
{
	var CoTree = function() {
		this.root = null;
		this.childrenLists = {};
		this.names = {};
	};

	var proto = CoTree.prototype;
	proto.createNode = function(id, name, children) {
		this.childrenLists[id] = children;
		this.names[id] = name;
	};

	proto.setRoot = function(id) {
		this.root = id;
	};

	proto.localInsert = function(p, pos, id, name) {
		var move = true;
		if (undefined === this.names[id]) {
			this.childrenLists[id] = [];
			this.names[id] = name;
			move = false;
		}
		this.childrenLists[p].splice(pos, 0, id);
		return {
			collab: p,
			value: { name: name, id: id },
			position: pos,
			move: move
		};
	};
	proto.localUpdate = function(id, name) {
		this.names[id] = name;
		return {
			collab: id,
			value: name,
			position: 0
		};
	};
	proto.localDelete = function(p, id, keep) {
		if (!keep) {
			delete this.names[id];
			delete this.childrenLists[id];
		}
		var pos = this.childrenLists[p].indexOf(id);
		this.childrenLists[p].splice(pos, 1);
		return {
			collab: p,
			position: pos,
			move: keep
		};
	};

	proto.remoteInsert = function(p, pos, id, name) {
		this.childrenLists[p].splice(pos, 0, id);
		if (undefined === this.names[id]) {
			this.childrenLists[id] = [];
			this.names[id] = name;
			return true;
		}
		return false;
	};
	proto.remoteUpdate = function(id, name) {
		this.names[id] = name;
	};
	proto.remoteDelete = function(p, pos, keep) {
		var id = this.childrenLists[p][pos];
		if (!keep) {
			delete this.names[id];
			delete this.childrenLists[id];
		}
		this.childrenLists[p].splice(pos, 1);
	};

	proto.toString = function() {
		var s = "";
		var q = [this.root];
		while (q.length > 0) {
			var at = q.shift();
			var cl = this.childrenLists[at];
			s += at + ": ";
			array.forEach(this.childrenLists[at], function(child) {
				q.push(child);
				s += child + ","
			});
			s = s.substring(0, s.length - 1);
			s += "\n";
		}
		return s.substring(0, s.length - 1);
	};

	return CoTree;
});

