define(['coweb/main', 'dojo', 'dojox/gfx', 'dojox/gfx/matrix', 'dojox/gfx/Moveable', './tMoveable'], function(coweb, dojo, gfx, matrix, Moveable, tMoveable) {
	var opts = Object.prototype.toString;
    function isArray(it) { return opts.call(it) === "[object Array]"; };

	var WhiteBoard = function(args) {
		if (args.diagonal) {
			this.ppi = (Math.sqrt((screen.width * screen.width) + (screen.height * screen.height))) / args.diagonal;
			this.ppi = Math.round((this.ppi) * 100) / 100;
		}
        this.id = args.id;
        this.collab = coweb.initCollab({id : this.id});  
        this.collab.subscribeReady(this,'onCollabReady');
        this.collab.subscribeSync('whiteboardUpdate', this, 'onWhiteboardUpdate');
        this.collab.subscribeSync('whiteboardUpdateHistory', this, 'onWhiteboardUpdateHistory');
        this.collab.subscribeSync('whiteboardClear', this, 'onWhiteboardClear');
        this.collab.subscribeSync('whiteboardMove', this, 'onWhiteboardMove');
        this.collab.subscribeSync('whiteboardModeChange', this, 'onWhiteboardModeChange');
        this.collab.subscribeSync('whiteboardShapeSelected', this, 'onWhiteboardShapeSelected');
        this.collab.subscribeStateRequest(this, 'onStateRequest');
    	this.collab.subscribeStateResponse(this, 'onStateResponse');
        if (args.attachee) {
    		this.attachee = dojo.byId(args.attachee);
            this.collab.subscribeSync('whiteboardAttach', this, 'onWhiteboardAttach');
        } else {
        	this.container = dojo.byId(args.container);
            this.surface = gfx.createSurface(this.container, args.width, args.height);
        	this.group = this.surface.createGroup();
        	this._createEventListeners();
        }
    	this.q = [];
    	this.points = [];
    	this.history = [];
    	this.shapes = [];
    	this.currentType = "draw";
    	this.currentId = 0;
		this.lastPoint = undefined;
		this.last = undefined;
    	this.attached = false;
    	this.color = "black";
    	this.lineSize = 3;
    	this.mode = "draw";
    	this.selectedId = -1;
    	
        this.collab.pauseSync();
        this.t = setTimeout(dojo.hitch(this, '_iterate'), 100);
	};
	
	WhiteBoard.prototype = {
		attach: function(distribute) {
			if (distribute === undefined) { distribute = true; }
			if (!this.attached) {
		    	this.attached = true;
				dojo.style(this.attachee.parentNode, "position", "relative");
				var width = dojo.style(this.attachee, "width"); 
				var height = dojo.style(this.attachee, "height"); 
				this.container = dojo.create("div", null, this.attachee.parentNode);
		        this.surface = gfx.createSurface(this.container, width, height);
		    	this.group = this.surface.createGroup();
	        	this._createEventListeners();
				dojo.style(this.container, "position", "absolute");
				dojo.style(this.container, "top", "0px");
				dojo.style(this.container, "left", "0px");
				dojo.style(this.container, "width", width);
				dojo.style(this.container, "height", height);
				dojo.style(this.container, "background", "rgba(0, 0, 0, 0.1)");
				if (distribute) {
					this.collab.sendSync('whiteboardAttach', {attached: this.attached}, "insert");					
				}
			}
		},
		detach: function(distribute) {
			if (distribute === undefined) { distribute = true; }
			if (this.attached) {
		    	this.attached = false;
				dojo.style(this.attachee.parentNode, "position", "static");
				dojo.destroy(this.container);
				this.container = null;
				if (distribute) {
					this.collab.sendSync('whiteboardAttach', {attached: this.attached}, "delete");					
				}
			}
		},
		_render: function(points, distribute, ppi) {
			if (this.last !== undefined) {
				this.group.remove(this.last);
			}
			var shape;
			if (this.currentType === "draw") {
				shape = this._renderDraw(points);
			} else if (this.currentType === "line") {
				shape = this._renderLine(points);
			} else if (this.currentType === "rect") {
				shape = this._renderRect(points);
			} else if (this.currentType === "ellipse") {
				shape = this._renderEllipse(points);
			} else if (this.currentType === "arrow") {
				shape = this._renderArrow(points);
			} else if (this.currentType === "measure") {
				shape = this._renderMeasure(points, ppi);
			}
			if (distribute) {
				this.collab.sendSync('whiteboardUpdate', {points: points, lastPoint: this.lastPoint, currentType: this.currentType, color: this.color, lineSize: this.lineSize, srcppi: this.ppi}, "insert");
			}
			return shape;
		},
		_renderDraw: function(points) {
			var group = this.group.createGroup();
			var path;
			if (isArray(points)) {
				var pathArg = [];
				for (var i = 0; i < points.length; i++) {
					var p = points[i];
					if (i==0) {
						pathArg.push("M " + p.x +" "+ p.y);
					} else {
						pathArg.push(" " + p.x +" "+ p.y);
					}
				}
				path = pathArg.join(" ");
			} else {
				path = points.path;
			}
			group.createPath(path).setStroke({color: this.color, width: this.lineSize, cap: "round"});
			return group; 
		},
		_renderLine: function(points) {
			var group = this.group.createGroup();
			var x1, y1, x2, y2;
			if (isArray(points)) {
				x1 = points[0].x;
				y1 = points[0].y;
				x2 = this.lastPoint.x;
				y2 = this.lastPoint.y;
			} else {
				x1 = points.x1;
				y1 = points.y1;
				x2 = points.x2;
				y2 = points.y2;
			}
			group.createLine({ x1: x1, y1: y1, x2: x2, y2: y2 }).setStroke({color: this.color, width: this.lineSize});
			return group;
		},
		_renderRect: function(points) {
			var group = this.group.createGroup();
			var x, y, width, height;
			if (isArray(points)) {
				x = this.lastPoint.x > points[0].x ? points[0].x : this.lastPoint.x;
				y = this.lastPoint.y > points[0].y ? points[0].y : this.lastPoint.y;
				width = this.lastPoint.x > points[0].x ? this.lastPoint.x - points[0].x : points[0].x - this.lastPoint.x;
				height = this.lastPoint.y > points[0].y ? this.lastPoint.y - points[0].y : points[0].y - this.lastPoint.y;
			} else {
				x = points.x;
				y = points.y;
				width = points.width;
				height = points.height;
			}
			group.createRect({x: x, y: y, width: width, height: height, r: 20 }).setStroke({color: this.color, width: 3}).setFill(this.color);
			return group;
		},
		_renderEllipse: function(points) {
			var group = this.group.createGroup();
			var cx, cy, rx, ry;
			if (isArray(points)) {
				cx = points[0].x + ((this.lastPoint.x - points[0].x) / 2);
				cy = points[0].y + ((this.lastPoint.y - points[0].y) / 2);
				ry = this.lastPoint.y > points[0].y ? (this.lastPoint.y - points[0].y) / 2 : (points[0].y - this.lastPoint.y) / 2;
				rx = this.lastPoint.x > points[0].x ? (this.lastPoint.x - points[0].x) / 2 : (points[0].x - this.lastPoint.x) / 2;
			} else {
				cx = points.cx;
				cy = points.cy;
				rx = points.rx;
				ry = points.ry;
			}
			group.createEllipse({ cx: cx, cy: cy, ry:ry, rx: rx }).setStroke({color: this.color, width: 3}).setFill(this.color);
			return group;
		},
		_renderArrow: function(points) {
			var x1, y1, x2, y2;
			if (isArray(points)) {
				x1 = points[0].x;
				y1 = points[0].y;
				x2 = this.lastPoint.x;
				y2 = this.lastPoint.y;
			} else {
				x1 = points.x1;
				y1 = points.y1;
				x2 = points.x2;
				y2 = points.y2;
			}
			var group = this.group.createGroup();
			group.createLine({ x1: x1, y1: y1, x2: x2, y2: y2 }).setStroke({color: this.color, width: this.lineSize});
		    var angle = Math.atan2(y2-y1, x2-x1);
		    var cosAngle = Math.cos(angle);
		    var sinAngle = Math.sin(angle);

		    var strokeWidth = this.lineSize;
		    var l = 4*strokeWidth;
		    var w = 2*strokeWidth;
		    var newx = x2 + strokeWidth*cosAngle;
		    var newy = y2 + strokeWidth*sinAngle;

		    var arrow = group.createPolyline([{x: newx, y: newy}, 
			                                      {x: (newx - l*cosAngle - w*sinAngle), y: (newy - l*sinAngle + w*cosAngle)}, 
											      {x: (newx - l*cosAngle + w*sinAngle), y: (newy - l*sinAngle - w*cosAngle)}]);
		    arrow.setFill(this.color).setStroke({color: this.color, width: 1});
		    return group;
		},
		_renderMeasure: function(points, ppi) {
			var srcppi = ppi || this.ppi;
			var x1, y1, x2, y2;
			if (isArray(points)) {
				x1 = points[0].x;
				y1 = points[0].y;
				x2 = this.lastPoint.x;
				y2 = this.lastPoint.y;
			} else {
				srcppi = points.srcppi;
				x1 = points.x1;
				y1 = points.y1;
				x2 = points.x2;
				y2 = points.y2;
			}
			if (srcppi !== this.ppi) {
				var pixelwidth = x2 - x1;
				var pixelheight = y2 - y1;
				var widthInMM = (pixelwidth / this.ppi) * 25.4;
				var heightInMM = (pixelheight / this.ppi) * 25.4;
				var srcWidthInMM = (pixelwidth / srcppi) * 25.4;
				var srcHeightInMM = (pixelheight / srcppi) * 25.4;
				var widthDiff = srcWidthInMM - widthInMM;
				var heightDiff = srcHeightInMM - heightInMM;
				var widthDiffInPixels = (widthDiff / 25.4) * this.ppi;
				var heightDiffInPixels = (heightDiff / 25.4) * this.ppi;
				x2 = x2 + widthDiffInPixels;
				y2 = y2 + heightDiffInPixels;
			}
			var group = this.group.createGroup();
			group.createLine({ x1: x1, y1: y1, x2: x2, y2: y2 }).setStroke({color: this.color, width: this.lineSize});
		    var angle = Math.atan2(y1-y2, x1-x2);
		    var cosAngle = Math.cos(angle);
		    var sinAngle = Math.sin(angle);

		    var strokeWidth = this.lineSize;
		    var w = strokeWidth + 10;
			group.createLine({ x1: x1 + (w*sinAngle), y1: y1 + (-w*cosAngle), x2: x1 + (-w*sinAngle), y2: y1 + (w*cosAngle) }).setStroke({color: this.color, width: 3});
			group.createLine({ x1: x2 + (w*sinAngle), y1: y2 + (-w*cosAngle), x2: x2 + (-w*sinAngle), y2: y2 + (w*cosAngle) }).setStroke({color: this.color, width: 3});
			
			var distance = Math.sqrt(((x2-x1)*(x2-x1))+((y2-y1)*(y2-y1)));
			distance = Math.round((distance * 25.4) / this.ppi);
			group.createText({ x:x1+((x2-x1)/2)-10, y:y1+((y2-y1)/2)-10, text:distance+"mm", align:"start"}).setFill(this.color);
			return group;
		},
		_createEventListeners: function() {
			if (dojo.isIos) {
		    	dojo.connect(this.container, "touchstart", this, "_handleTouchStart");
			} else {
				dojo.connect(this.container, "mousedown", this, "_handleMouseStart");
			}
			dojo.connect(this.container, "onclick", this, "_handleClick");
		},
		_distance: function(x1, y1, x2, y2) {
			return Math.abs(Math.sqrt(Math.pow(x1-x2, 2)+Math.pow(y1-y2, 2)));
		},
		_handleTouchStart: function(evt) {
    		evt.preventDefault();
			if (this.mode === "draw") {
	    		var touch = evt.touches[0];
	    		var point = this._getPoint(touch);
	    		this.points = [point];
	    		this.lastPoint = point;
	    		this.moveListener = dojo.connect(this.container, "touchmove", this, "_handleTouchMove");
	    		this.moveEndListener = dojo.connect(this.container, dojo.isIos ? "touchend" : "mouseup", this, "_handleMoveEnd");
			} else {
				this._handleClick(evt);
			}
		},
		_handleMouseStart: function(evt) {
    		evt.preventDefault();
			if (this.mode === "draw") {
				var point = this._getPoint(evt);
				this.points = [point];
				this.lastPoint = point;
				if (evt.button != dojo.mouseButtons.RIGHT){
		    		this.moveListener = dojo.connect(this.container, "mousemove", this, "_handleMouseMove");
		    		this.moveEndListener = dojo.connect(this.container, dojo.isIos ? "touchend" : "mouseup", this, "_handleMoveEnd");
				}
			}
		},
		_handleTouchMove: function(evt) {
			evt.preventDefault();
			var t = evt.touches[0];
			
			if (this._distance(t.screenX, t.screenY, this.lastPoint.x, this.lastPoint.y) > 15) {
				var p = this._getPoint(t);
				this.points.push(p);
				this.lastPoint = p;
				this.last = this._render(this.points, true);
			}
		},
		_handleMouseMove: function(evt) {
    		evt.preventDefault();
			var p = this._getPoint(evt);
			if (this._distance(p.x, p.y, this.lastPoint.x, this.lastPoint.y) > 15) {
				this.points.push(p);
				this.lastPoint = p;
				this.last = this._render(this.points, true);
			}
		},
		_handleMoveEnd: function(evt) {
    		dojo.disconnect(this.moveListener);
    		dojo.disconnect(this.moveEndListener);
    		var data;
    		if (this.last) {
	    		switch (this.currentType) {
	    			case "draw": 
	    				data = {path: this.last.children[0].shape.path};
	    				break;
	    			case "line": 
	    				data = {x1: this.last.children[0].shape.x1, y1: this.last.children[0].shape.y1, x2: this.last.children[0].shape.x2, y2: this.last.children[0].shape.y2};
	    				break;
	    			case "rect": 
	    				data = {x: this.last.children[0].shape.x, y: this.last.children[0].shape.y, width: this.last.children[0].shape.width, height: this.last.children[0].shape.height};
	    				break;
	    			case "ellipse": 
	    				data = {cx: this.last.children[0].shape.cx, cy: this.last.children[0].shape.cy, rx: this.last.children[0].shape.rx, ry: this.last.children[0].shape.ry};
	    				break;
	    			case "arrow": 
	    				data = {x1: this.last.children[0].shape.x1, y1: this.last.children[0].shape.y1, x2: this.last.children[0].shape.x2, y2: this.last.children[0].shape.y2};
	    				break;
	    			case "measure":
						var x1 = this.last.children[0].shape.x1;
						var y1 = this.last.children[0].shape.y1;
						var x2 = this.last.children[0].shape.x2;
						var y2 = this.last.children[0].shape.y2;
	    				data = {x1: x1, y1: y1, x2: x2, y2: y2, srcppi: this.ppi};
	    				break;
	    		}
	    		var shapeId = this.currentId++;
	    		var historyEntry = {data: data, type: this.currentType, color: this.color, lineSize: this.lineSize, id: shapeId}; 
	    		this.history[shapeId] =  historyEntry;
	    		this.shapes[shapeId] = {shape: this.last};
				this.collab.sendSync('whiteboardUpdateHistory', historyEntry, "insert");
	    		this.points = [];
				this.last = undefined;
    		}
		},
		_handleClick: function (evt) {
			if (this.mode === "move") {
				var point = this._getPoint(evt);
		        for (var i = 0; i < this.history.length; i++) {
		        	var id = this.history[i].id;
		        	var type = this.history[i].type;
		        	var container = this.shapes[id];
					var bbox = container.shape.children[0].getBoundingBox();
					var x1 = bbox.x;
					var y1 = bbox.y;
					if (container.shape.matrix) {
						x1 += container.shape.matrix.dx;
						y1 += container.shape.matrix.dy;
					}
					var x2 = x1 + bbox.width;
					var y2 = y1 + bbox.height;
					if (point.x > x1 && point.x < x2 && point.y > y1 && point.y < y2) {
						if (this.selectedId !== id) {
							this._shapeSelected(id, type, this, container);
			                this.collab.sendSync('whiteboardShapeSelected', {id: id}, "update");					
							break;
						}
					}
				}
			}
		},
		clear: function(distribute) {
			this.group.clear();
    		this.points = [];
    		this.history = [];
    		this.lastPoint = undefined;
			this.last = undefined;
			this.currentId = 0;
			if (distribute === undefined) { distribute = true; }
    		if (distribute) {
    			this.collab.sendSync('whiteboardClear', {}, "delete");
    		}
		},
		setRenderType: function(type) {
			this.currentType = (type === "measure" && !this.ppi) ? this.currentType : type;
		},
		getMode: function() {
			return this.mode;
		},
		setDrawMode: function(distribute) {
			if (distribute === undefined) { distribute = true; }
			this.mode = "draw";
			if (this.selectedId !== -1) {
				var selected = this.shapes[this.selectedId];
				selected.shape.remove(selected.shape.children[selected.shape.children.length-1]);
				selected.moveable.destroy();
				delete selected.moveable;
				this.selectedId = -1;
			}
    		if (distribute) {
    			this.collab.sendSync('whiteboardModeChange', {mode: this.mode}, "update");
    		}
		},
		setMoveMode: function(distribute) {
			if (distribute === undefined) { distribute = true; }
			this.mode = "move";
    		if (distribute) {
    			this.collab.sendSync('whiteboardModeChange', {mode: this.mode}, "update");
    		}
		},
		getColor: function() {
			return this.color;
		},
		setColor: function(color) {
			this.color = color;
		},
		getLineSize: function() {
			return this.lineSize;
		},
		setLineSize: function(lineSize) {
			this.lineSize = lineSize;
		},
		onCollabReady: function() {
	        this.collab.pauseSync();
		},
		onWhiteboardUpdate: function(obj) {
			this.q.push(obj);
		},
		onWhiteboardUpdateHistory: function(obj) {
    		this.history[obj.value.id] = obj.value;
    		this.shapes[obj.value.id] = {shape: this.last};
    		this.last = undefined;
    		this.currentId++;
		},
		onWhiteboardClear: function(obj) {
			this.clear(false);
		},
		onWhiteboardMove: function(obj) {
			var shape = this.shapes[obj.value.id].shape;
			if (shape) {
				shape.applyLeftTransform(new matrix.Matrix2D(JSON.parse(obj.value.shift)));
				var type = this.history[obj.value.id].type;
				var transform = JSON.stringify(shape.getTransform());
				var data;
				switch (type) {
	    			case "draw": 
	    				data = {path: shape.children[0].shape.path, transform: transform};
	    				break;
	    			case "line": 
	    				data = {x1: shape.children[0].shape.x1, y1: shape.children[0].shape.y1, x2: shape.children[0].shape.x2, y2: shape.children[0].shape.y2, transform: transform};
	    				break;
	    			case "rect": 
	    				data = {x: shape.children[0].shape.x, y: shape.children[0].shape.y, width: shape.children[0].shape.width, height: shape.children[0].shape.height, transform: transform};
	    				break;
	    			case "ellipse": 
	    				data = {cx: shape.children[0].shape.cx, cy: shape.children[0].shape.cy, rx: shape.children[0].shape.rx, ry: shape.children[0].shape.ry, transform: transform};
	    				break;
	    			case "arrow": 
	    				data = {x1: shape.children[0].shape.x1, y1: shape.children[0].shape.y1, x2: shape.children[0].shape.x2, y2: shape.children[0].shape.y2, transform: transform};
	    				break;
	    			case "measure":
						var x1 = shape.children[0].shape.x1;
						var y1 = shape.children[0].shape.y1;
						var x2 = shape.children[0].shape.x2;
						var y2 = shape.children[0].shape.y2;
	    				data = {x1: x1, y1: y1, x2: x2, y2: y2, srcppi: this.ppi};
	    				break;
				}
				this.history[obj.value.id].data = data;
			} else {
				console.log("shape id "+ obj.value.id + " invalid");
			}
		},
		onWhiteboardAttach: function(obj) {
			if (obj.value.attached) {
				this.attach(false);
			} else {
				this.detach(false);
			}
		},
		onWhiteboardModeChange: function(obj) {
			if (obj.value.mode !== this.getMode()) {
				if (obj.value.mode === "draw") {
					this.setDrawMode(false);
				} else {
					this.setMoveMode(false);
				}
			}
		},
		onWhiteboardShapeSelected: function(obj) {
			if (this.mode === "move") {
				this._shapeSelected(obj.value.id, this.history[obj.value.id].type, this, this.shapes[obj.value.id]);
			}
		},
	    onStateRequest: function(token){
	        var state = {history: this.history, currentId: this.currentId, attached: this.attached, mode: this.mode, selectedId: this.selectedId};
	        console.log("state request:"+JSON.stringify(state));
	        this.collab.sendStateResponse(state,token);
	    },
	    onStateResponse: function(obj){
	        console.log("state response:"+JSON.stringify(obj));
			if (obj.attached) {
				this.attach(false);
			} else {
				this.detach(false);
			}
        	this.currentId = obj.currentId;
	        if (obj.history) {
		        this.history = obj.history;
		        for (var i = 0; i < this.history.length; i++) {
		        	this.currentType = this.history[i].type;
		        	this.color = this.history[i].color;
		        	this.lineSize = this.history[i].lineSize;
		        	var shape = this._render(this.history[i].data, false);
		        	if (this.history[i].data.transform) {
						shape.applyLeftTransform(new matrix.Matrix2D(JSON.parse(this.history[i].data.transform)));
		        	}
		        	this.shapes[this.history[i].id] = {shape: shape};
		        	
		        }
	        } else {
	        	console.warn("state response does not contain history data !!!");
	        }
			if (obj.mode === "draw") {
				this.setDrawMode();
			} else {
				this.setMoveMode(false);
				if (obj.selectedId !== -1) {
					this._shapeSelected(obj.selectedId, this.history[obj.selectedId].type, this, this.shapes[obj.selectedId]);
				}
			}
	    },
	    _iterate: function() {
	        this.collab.resumeSync();
	        this.collab.pauseSync();
	        if(this.q.length > 0) {
	        	for (var i = 0; i < this.q.length; i++) {
	        		this.points = this.q[i].value.points;
	        		this.lastPoint = this.q[i].value.lastPoint;
	        		this.currentType = this.q[i].value.currentType;
	        		this.color = this.q[i].value.color;
	        		this.lineSize = this.q[i].value.lineSize;
	        		this.last = this._render(this.points, false, this.q[i].value.srcppi);
	        	}
	        }
	        this.q = [];
	        this.t = setTimeout(dojo.hitch(this, '_iterate'), 100);
	    },
		_getPoint: function(evt) {
			if (evt.offsetX) {
				return { x: evt.offsetX, y: evt.offsetY };
			}
			else {
				var offsetLeft = this.attachee ? this.container.parentNode.offsetLeft : this.container.offsetLeft;
				var offsetTop = this.attachee ? this.container.parentNode.offsetTop : this.container.offsetTop;
				return { x: evt.pageX - offsetLeft, y: evt.pageY - offsetTop };
			}			
		},
		_createMoveListener: function(id, shape) {
			var shapeId = id;
			var scope = this;
			var moveable = dojo.isIos ? new tMoveable(shape) : new Moveable(shape);
			var scope = this;
			moveable.onMoved = function(mover, shift) {
				scope.history[shapeId].data.transform = JSON.stringify(mover.shape.getTransform());
                scope.collab.sendSync('whiteboardMove', {shift: JSON.stringify(shift), id: shapeId}, "update");					
			};
			return moveable;
		},
		_shapeSelected: function(id, type, scope, container) {
			if (scope.selectedId !== -1) {
				var selected = scope.shapes[scope.selectedId];
				selected.shape.remove(selected.shape.children[selected.shape.children.length-1]);
				selected.moveable.destroy();
				delete selected.moveable;
			}
			var bbox = container.shape.children[0].getBoundingBox();
			var border = {x: bbox.x - this.lineSize, y: bbox.y - this.lineSize, width: bbox.width + (this.lineSize*2), height: bbox.height + (this.lineSize*2)};
			container.shape.createRect(border).setStroke({color: "black", width: 1, style: "shortdash"}).setFill(dojo.Color.named.transparent);
			container.moveable = scope._createMoveListener(id, container.shape);
			scope.selectedId = id;
		}
	};
	
	return WhiteBoard;
});