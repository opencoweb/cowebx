/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/dtl/dom","dojox/dtl/Context","dojox/dtl/tests/dom/util"],function(_1,_2,_3){_1.getObject("dojox.dtl.tests.dom.buffer",1);doh.register("dojox.dtl.dom.buffer",[function test_insertion_order_text(t){var dd=_3.dtl;var _4=new dd.Context({first:false,last:false});var _5=new dd.DomTemplate("<div>{% if first %}first{% endif %}middle{% if last %}last{% endif %}</div>");t.is("<div>middle</div>",dd.tests.dom.util.render(_5,_4));_4.first=true;t.is("<div>firstmiddle</div>",dd.tests.dom.util.render(_5,_4));_4.first=false;_4.last=true;t.is("<div>middlelast</div>",dd.tests.dom.util.render(_5,_4));_4.first=true;t.is("<div>firstmiddlelast</div>",dd.tests.dom.util.render(_5,_4));}]);});require(["dojox/dtl/tests/dom/buffer"]);