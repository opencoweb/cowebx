/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

(function(){var _1={identifier:"id",label:"id",items:[]};var _2=["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];var _3=[];var i,_4,j;for(i=0;i<100;++i){_4={};for(j=0;j<_2.length;++j){_4[_2[j]]=(i+1)+_2[j];}_3.push(_4);}var _5=_3.length;for(i=0;i<_5;++i){_1.items.push(dojo.mixin({"id":i+1},_3[i]));}if(!this.test_store_data){this.test_store_data=[];}this.test_store_data.push(dojo.clone(_1));if(!this.test_store){this.test_store=[];}this.test_store.push(new dojo.data.ItemFileWriteStore({data:_1}));})();