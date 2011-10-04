/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/wire/tests/programmatic/_base","dojox/wire/tests/programmatic/Wire","dojox/wire/tests/programmatic/CompositeWire","dojox/wire/tests/programmatic/TableAdapter","dojox/wire/tests/programmatic/TreeAdapter","dojox/wire/tests/programmatic/TextAdapter"],function(_1,_2,_3){_1.getObject("dojox.wire.tests.wire",1);try{_1.requireIf(_1.isBrowser,"dojox.wire.tests.programmatic.DataWire");_1.requireIf(_1.isBrowser,"dojox.wire.tests.programmatic.XmlWire");}catch(e){doh.debug(e);}});require(["dojox/wire/tests/wire"]);