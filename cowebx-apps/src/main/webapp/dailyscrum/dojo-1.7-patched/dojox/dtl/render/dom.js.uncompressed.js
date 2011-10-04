/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo/_base/lang","../Context","../dom","dojo/_base/html","dojo/_base/kernel"], function(dojo,ddc){
	dojo.getObject("dtl.render.dom", true, dojox);

	dojox.dtl.render.dom.Render = function(/*DOMNode?*/ attachPoint, /*dojox.dtl.DomTemplate?*/ tpl){
		this._tpl = tpl;
		this.domNode = dojo.byId(attachPoint);
	}
	dojo.extend(dojox.dtl.render.dom.Render, {
		setAttachPoint: function(/*Node*/ node){
			this.domNode = node;
		},
		render: function(/*Object*/ context, /*dojox.dtl.DomTemplate?*/ tpl, /*dojox.dtl.DomBuffer?*/ buffer){
			if(!this.domNode){
				throw new Error("You cannot use the Render object without specifying where you want to render it");
			}

			this._tpl = tpl = tpl || this._tpl;
			buffer = buffer || tpl.getBuffer();
			context = context || new ddc();

			var frag = tpl.render(context, buffer).getParent();
			if(!frag){
				throw new Error("Rendered template does not have a root node");
			}

			if(this.domNode !== frag){
				this.domNode.parentNode.replaceChild(frag, this.domNode);
				this.domNode = frag;
			}
		}
	});
	return dojox.dtl.render.dom;
});