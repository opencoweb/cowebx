/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/dtl/_Templated","dijit/_Widget"],function(_1,_2,_3){_1.getObject("dojox.data.demos.widgets.FlickrViewList",1);_1.declare("dojox.data.demos.widgets.FlickrViewList",[_2._Widget,_3.dtl._Templated],{store:null,items:null,templateString:_1.cache("dojox","data/demos/widgets/templates/FlickrViewList.html"),fetch:function(_4){_4.onComplete=_1.hitch(this,"onComplete");_4.onError=_1.hitch(this,"onError");return this.store.fetch(_4);},onError:function(){this.items=[];this.render();},onComplete:function(_5,_6){this.items=_5||[];this.render();}});});require(["dojox/data/demos/widgets/FlickrViewList"]);