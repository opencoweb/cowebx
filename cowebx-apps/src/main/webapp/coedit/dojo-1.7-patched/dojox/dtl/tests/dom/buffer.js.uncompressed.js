/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/dtl/dom","dojox/dtl/Context","dojox/dtl/tests/dom/util"], function(dojo, dijit, dojox){
dojo.getObject("dojox.dtl.tests.dom.buffer", 1);
/* builder delete begin
dojo.provide("dojox.dtl.tests.dom.buffer");


 builder delete end */
/* builder delete begin
dojo.require("dojox.dtl.dom");

 builder delete end */
/* builder delete begin
dojo.require("dojox.dtl.Context");

 builder delete end */
/* builder delete begin
dojo.require("dojox.dtl.tests.dom.util");


 builder delete end */
doh.register("dojox.dtl.dom.buffer",
	[
		function test_insertion_order_text(t){
			var dd = dojox.dtl;

			var context = new dd.Context({
				first: false,
				last: false
			});

			var template = new dd.DomTemplate("<div>{% if first %}first{% endif %}middle{% if last %}last{% endif %}</div>");
			t.is("<div>middle</div>", dd.tests.dom.util.render(template, context));

			context.first = true;
			t.is("<div>firstmiddle</div>", dd.tests.dom.util.render(template, context));

			context.first = false;
			context.last = true;
			t.is("<div>middlelast</div>", dd.tests.dom.util.render(template, context));

			context.first = true;
			t.is("<div>firstmiddlelast</div>", dd.tests.dom.util.render(template, context));
		}
	]
);
});
require(["dojox/dtl/tests/dom/buffer"]);
