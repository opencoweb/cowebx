/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojo/data/ItemFileWriteStore"], function(dojo, dijit, dojox){
dojo.getObject("dojox.grid.tests.support.test_data", 1);
// example sample data and code
/* builder delete begin
dojo.require("dojo.data.ItemFileWriteStore");

 builder delete end */
(function(){
	// some sample data
	// global var "data"
	data = {
		identifier: 'id',
		label: 'id',
		items: []
	};
	data_list = [
		{ col1: "normal", col2: false, col3: "new", col4: 'But are not followed by two hexadecimal', col5: 29.91, col6: 10, col7: false },
		{ col1: "important", col2: false, col3: "new", col4: 'Because a % sign always indicates', col5: 9.33, col6: -5, col7: false },
		{ col1: "important", col2: false, col3: "read", col4: 'Signs can be selectively', col5: 19.34, col6: 0, col7: true },
		{ col1: "note", col2: false, col3: "read", col4: 'However the reserved characters', col5: 15.63, col6: 0, col7: true },
		{ col1: "normal", col2: false, col3: "replied", col4: 'It is therefore necessary', col5: 24.22, col6: 5.50, col7: true },
		{ col1: "important", col2: false, col3: "replied", col4: 'To problems of corruption by', col5: 9.12, col6: -3, col7: true },
		{ col1: "note", col2: false, col3: "replied", col4: 'Which would simply be awkward in', col5: 12.15, col6: -4, col7: false }
	];
	var rows = 100;
	for(var i=0, l=data_list.length; i<rows; i++){
		data.items.push(dojo.mixin({ id: i }, data_list[i%l]));
	}

	// global var "test_store"
	test_store = new dojo.data.ItemFileWriteStore({data: data});
})();

});
require(["dojox/grid/tests/support/test_data"]);
