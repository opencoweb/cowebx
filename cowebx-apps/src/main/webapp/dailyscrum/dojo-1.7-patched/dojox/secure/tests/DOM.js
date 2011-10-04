/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/secure/DOM"],function(_1,_2,_3){_1.getObject("dojox.secure.tests.DOM",1);doh.register("dojox.secure.tests.DOM.good",[function setup(){var _4=document.createElement("div");document.body.appendChild(_4);_4.innerHTML="Sandboxed div:";_4.style.position="absolute";_4.style.top="100px";_4.style.left="100px";_4.style.backgroundColor="red";_4.style.color="white";var _5=document.createElement("div");_5.style.backgroundColor="cyan";_5.style.color="black";_4.appendChild(_5);wrap=_3.secure.DOM(_5);securedElement=wrap(_5);securedDoc=securedElement.ownerDocument;},function innerHTML(t){securedElement.innerHTML="Hi there";t.assertEqual("Hi there",securedElement.data__.innerHTML);},function docWrite(t){securedDoc.write("<div style='color:red'>written</div>");securedDoc.close();t.t(securedElement.data__.innerHTML.match(/written/));},function addNode(t){var _6=securedDoc.createElement("div");_6.innerHTML="inner div";_6.style.color="blue";securedElement.appendChild(_6);t.t(securedElement.data__.innerHTML.match(/inner/));},function addOnclickHandler(t){securedElement.addEventListener("click",function(_7){alert("proper click handler");});}]);function _8(_9){return {name:_9.name,runTest:function(t){var _a;try{_9(t);_a=true;}catch(e){}t.f(_a);}};};doh.register("dojox.secure.tests.DOM.bad",[function parentNode(t){t.f(securedElement.parentNode);},function innerHTMLScript(t){try{securedElement.innerHTML="<script>bad=true</script>";}catch(e){}t.t(typeof bad=="undefined");},function innerHTMLScript2(t){try{securedElement.innerHTML="</script><script>bad=true;//";}catch(e){}t.t(typeof bad=="undefined");},function writeScript(t){try{securedDoc.write("<script>bad=true;</script>");}catch(e){}t.t(typeof bad=="undefined");},function appendScript(t){try{var _b=securedDoc.createElement("script");_b.appendChild(securedDoc.createTextNode("bad=true"));securedElement.appendChild(_b);}catch(e){}t.t(typeof bad=="undefined");},function cssExpression(t){if(_1.isIE){securedElement.innerHTML="<div id=\"oDiv\" style=\"left:expression((bad=true), 0)\">Example DIV</div>";t.t(typeof bad=="undefined");}else{try{securedElement.innerHTML="<input style='-moz-binding: url(\"http://www.mozilla.org/xbl/htmlBindings.xml#checkbox\");'>";}catch(e){}t.f(securedElement.innerHTML.match(/mozilla/));}},function cssExpression2(t){if(_1.isIE){securedElement.style.left="expression(alert(\"hello\"), 0)";t.f(securedElement.style.left.match(/alert/));}else{try{securedElement.style.MozBinding="url(\"http://www.mozilla.org/xbl/htmlBindings.xml#checkbox\")";}catch(e){}}},function cssExpression3(t){if(_1.isIE){securedElement.style.behavior="url(a1.htc)";t.f(securedElement.style.behavior);}else{}},function addJavaScriptHref(t){securedElement.innerHTML="<a href='javascript:alert(3)'>illegal link</a>";},function addOnclickHandler(t){try{securedElement.innerHTML="<div onclick='alert(4)'>illegal link</div>";}catch(e){}t.f(securedElement.innerHTML.match(/alert/));},function confusingHTML(t){try{securedElement.innerHTML="<div x=\"\"><img onload=alert(42)src=http://json.org/img/json160.gif>\"></div>";}catch(e){}t.f(securedElement.innerHTML.match(/alert/));},function confusingHTML2(t){try{securedElement.innerHTML="<iframe/src=\"javascript:alert(42)\"></iframe>";}catch(e){}t.f(securedElement.innerHTML.match(/alert/));},function confusingHTML2(t){try{securedElement.innerHTML="<iframe/ \"onload=alert(/XSS/)></iframe>";}catch(e){}t.f(securedElement.innerHTML.match(/alert/));}]);});require(["dojox/secure/tests/DOM"]);