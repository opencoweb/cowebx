/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

(function(){
	// some sample data
	var data = {
		identifier: 'id',
		label: 'id',
		items: []
	};
	var cols = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
	var data_list = [];
	var i, row, j;
	for(i = 0; i < 100; ++i){
		row = {};
		for(j = 0; j < cols.length; ++j){
			row[cols[j]] = (i + 1) + cols[j];
		}
		data_list.push(row);
	}
	var len = data_list.length;
	for(i=0; i < len ; ++i){
		data.items.push(dojo.mixin({ 'id': i+1 }, data_list[i]));
	}
	
	if(!this.test_store_data){
		this.test_store_data = [];
	}
	this.test_store_data.push(dojo.clone(data));
	
	if(!this.test_store){
		this.test_store = [];
	}
	this.test_store.push(new dojo.data.ItemFileWriteStore({data: data}));
})();
