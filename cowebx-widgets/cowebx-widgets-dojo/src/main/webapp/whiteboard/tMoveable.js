/*
	Copyright (c) 2004-2010, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
	
	customization for reacting to mobile safari touchevents done by Wesley Lauka ( www.wesleylauka.com )
	
	Additional conversion to AMD provided by Richard Backhouse IBM
 */

define(['dojo', './tMover'], function(dojo, tMover) {
	return dojo.declare("gfxTouch.tMoveable", null, {
		constructor : function(shape, params) {
			this.shape = shape;
			this.delay = (params && params.delay > 0) ? params.delay : 0;
			this.mover = (params && params.mover) ? params.mover : tMover;
			this.events = [ this.shape.connect("touchstart", this, "touchstart") ];
		},
		destroy : function() {
			dojo.forEach(this.events, this.shape.disconnect, this.shape);
			this.events = this.shape = null;
		},
		touchstart : function(e) {
			if (this.delay) {
				this.events.push(this.shape.connect("touchmove", this, "touchmove"));
				this.events.push(this.shape.connect("touchend", this, "touchend"));
				this._lastX = e.touches[0].clientX;
				this._lastY = e.touches[0].clientY;
			} else {
				new this.mover(this.shape, e, this);
			}
			dojo.stopEvent(e);
		},
		touchmove : function(e) {
			if (Math.abs(e.touches[0].clientX - this._lastX) > this.delay
					|| Math.abs(e.touches[0].clientY - this._lastY) > this.delay) {
				this.touchend(e);
				new this.mover(this.shape, e, this);
			}
			dojo.stopEvent(e);
		},
		touchend : function(e) {
			this.shape.disconnect(this.events.pop());
			this.shape.disconnect(this.events.pop());
		},
		onMoveStart : function(_3mover) {
			dojo.publish("/gfx/move/start", [ mover ]);
			dojo.addClass(dojo.body(), "dojoMove");
		},
		onMoveStop : function(mover) {
			dojo.publish("/gfx/move/stop", [ mover ]);
			dojo.removeClass(dojo.body(), "dojoMove");
		},
		onFirstMove : function(mover) {
		},
		onMove : function(mover, shift) {
			this.onMoving(mover, shift);
			this.shape.applyLeftTransform(shift);
			this.onMoved(mover, shift);
		},
		onMoving : function(mover, shift) {
		},
		onMoved : function(mover, shift) {
		}
	});
});
