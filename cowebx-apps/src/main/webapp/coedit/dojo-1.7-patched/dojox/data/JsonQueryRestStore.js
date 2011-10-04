/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox"],function(_1,_2,_3){_1.getObject("dojox.data.JsonQueryRestStore",1);define("dojox/data/JsonQueryRestStore",["dojo","dojox","dojox/data/JsonRestStore","dojox/data/util/JsonQuery"],function(_4,_5){_4.requireIf(!!_5.data.ClientFilter,"dojox.json.query");_4.declare("dojox.data.JsonQueryRestStore",[_5.data.JsonRestStore,_5.data.util.JsonQuery],{matchesQuery:function(_6,_7){return _6.__id&&(_6.__id.indexOf("#")==-1)&&this.inherited(arguments);}});return _5.data.JsonQueryRestStore;});});require(["dojox/data/JsonQueryRestStore"]);