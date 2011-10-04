/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/data/KeyValueStore","dojo/data/api/Read","dojo/data/api/Identity"],function(_1,_2,_3){_1.getObject("dojox.data.tests.stores.KeyValueStore",1);_3.data.tests.stores.KeyValueStore.getDatasource=function(_4){var _5={};var _6="stores/properties.js";if(_1.isBrowser){_5.url=_1.moduleUrl("dojox.data.tests",_6).toString();}else{var _7="/*[";_7+="{ \"year\": \"2007\" },";_7+="{ \"nmonth\": \"12\" },";_7+="{ \"month\": \"December\" },";_7+="{ \"nday\": \"1\" },";_7+="{ \"day\": \"Saturday\" },";_7+="{ \"dayOfYear\": \"335\" },";_7+="{ \"weekOfYear\": \"48\" }";_7+="]*/";_5.data=_7;}return _5;};_3.data.tests.stores.KeyValueStore.verifyItems=function(_8,_9,_a,_b){if(_9.length!=_b.length){return false;}for(var i=0;i<_9.length;i++){if(!(_8.getValue(_9[i],_a)===_b[i])){return false;}}return true;};_3.data.tests.stores.KeyValueStore.error=function(t,d,_c){for(i in _c){}d.errback(_c);};doh.register("dojox.data.tests.stores.KeyValueStore",[function testReadAPI_fetch_all(t){var _d=_3.data.tests.stores.KeyValueStore.getDatasource("stores/properties.js");var _e=new _3.data.KeyValueStore(_d);var d=new doh.Deferred();function _f(_10){t.assertTrue((_10.length===7));d.callback(true);};_e.fetch({onComplete:_f,onError:_1.partial(_3.data.tests.stores.KeyValueStore.error,t,d)});return d;},function testReadAPI_fetch_all_withEmptyStringField(t){var _11=_3.data.tests.stores.KeyValueStore.getDatasource();var _12=new _3.data.KeyValueStore(_11);var d=new doh.Deferred();function _13(_14){t.assertTrue((_14.length===7));d.callback(true);};_12.fetch({onComplete:_13,onError:_1.partial(_3.data.tests.stores.KeyValueStore.error,t,d)});return d;},function testReadAPI_fetch_one(t){var _15=_3.data.tests.stores.KeyValueStore.getDatasource();var _16=new _3.data.KeyValueStore(_15);var d=new doh.Deferred();function _17(_18,_19){t.is(1,_18.length);d.callback(true);};_16.fetch({query:{key:"year"},onComplete:_17,onError:_1.partial(_3.data.tests.stores.KeyValueStore.error,t,d)});return d;},function testReadAPI_fetch_Multiple(t){var _1a=_3.data.tests.stores.KeyValueStore.getDatasource();var _1b=new _3.data.KeyValueStore(_1a);var d=new doh.Deferred();var _1c=[false,false];function _1d(_1e,_1f){_1c[0]=true;t.is(1,_1e.length);if(_1c[0]&&_1c[1]){d.callback(true);}};function _20(_21,_22){_1c[1]=true;t.is(1,_21.length);if(_1c[0]&&_1c[1]){d.callback(true);}};try{_1b.fetch({query:{key:"year"},onComplete:_1d,onError:_1.partial(_3.data.tests.stores.KeyValueStore.error,t,d)});_1b.fetch({query:{key:"month"},onComplete:_20,onError:_1.partial(_3.data.tests.stores.KeyValueStore.error,t,d)});}catch(e){for(i in e){}}return d;},function testReadAPI_fetch_MultipleMixed(t){var _23=_3.data.tests.stores.KeyValueStore.getDatasource();var _24=new _3.data.KeyValueStore(_23);var d=new doh.Deferred();var _25=[false,false];function _26(_27,_28){_25[0]=true;t.is(1,_27.length);if(_25[0]&&_25[1]){d.callback(true);}};function _29(_2a){_25[1]=true;t.assertTrue(_2a!==null);t.is("year",_24.getValue(_2a,"key"));t.is(2007,_24.getValue(_2a,"value"));t.is(2007,_24.getValue(_2a,"year"));if(_25[0]&&_25[1]){d.callback(true);}};_24.fetch({query:{key:"day"},onComplete:_26,onError:_1.partial(_3.data.tests.stores.KeyValueStore.error,t,d)});_24.fetchItemByIdentity({identity:"year",onItem:_29,onError:_1.partial(_3.data.tests.stores.KeyValueStore.error,t,d)});return d;},function testReadAPI_fetch_all_streaming(t){var _2b=_3.data.tests.stores.KeyValueStore.getDatasource();var _2c=new _3.data.KeyValueStore(_2b);var d=new doh.Deferred();count=0;function _2d(_2e,_2f){t.assertTrue(_2e===7);};function _30(_31,_32){t.assertTrue(_2c.isItem(_31));count++;};function _33(_34,_35){t.is(7,count);t.is(null,_34);d.callback(true);};_2c.fetch({onBegin:_2d,onItem:_30,onComplete:_33,onError:_1.partial(_3.data.tests.stores.KeyValueStore.error,t,d)});return d;},function testReadAPI_fetch_paging(t){var _36=_3.data.tests.stores.KeyValueStore.getDatasource();var _37=new _3.data.KeyValueStore(_36);var d=new doh.Deferred();function _38(_39,_3a){t.is(5,_39.length);_3a.start=3;_3a.count=1;_3a.onComplete=_3b;_37.fetch(_3a);};function _3b(_3c,_3d){t.is(1,_3c.length);_3d.start=0;_3d.count=5;_3d.onComplete=_3e;_37.fetch(_3d);};function _3e(_3f,_40){t.is(5,_3f.length);_40.start=2;_40.count=20;_40.onComplete=_41;_37.fetch(_40);};function _41(_42,_43){t.is(5,_42.length);_43.start=9;_43.count=100;_43.onComplete=_44;_37.fetch(_43);};function _44(_45,_46){t.is(0,_45.length);_46.start=2;_46.count=20;_46.onComplete=_47;_37.fetch(_46);};function _47(_48,_49){t.is(5,_48.length);d.callback(true);};function _4a(_4b,_4c){t.is(7,_4b.length);_4c.start=1;_4c.count=5;_4c.onComplete=_38;_37.fetch(_4c);};_37.fetch({onComplete:_4a,onError:_1.partial(_3.data.tests.stores.KeyValueStore.error,t,d)});return d;},function testReadAPI_getLabel(t){var _4d=_3.data.tests.stores.KeyValueStore.getDatasource();var _4e=new _3.data.KeyValueStore(_4d);var d=new doh.Deferred();function _4f(_50,_51){t.assertEqual(_50.length,1);var _52=_4e.getLabel(_50[0]);t.assertTrue(_52!==null);t.assertEqual("year",_52);d.callback(true);};_4e.fetch({query:{key:"year"},onComplete:_4f,onError:_1.partial(_3.data.tests.stores.KeyValueStore.error,t,d)});return d;},function testReadAPI_getLabelAttributes(t){var _53=_3.data.tests.stores.KeyValueStore.getDatasource();var _54=new _3.data.KeyValueStore(_53);var d=new doh.Deferred();function _55(_56,_57){t.assertEqual(_56.length,1);var _58=_54.getLabelAttributes(_56[0]);t.assertTrue(_1.isArray(_58));t.assertEqual("key",_58[0]);d.callback(true);};_54.fetch({query:{key:"year"},onComplete:_55,onError:_1.partial(_3.data.tests.stores.KeyValueStore.error,t,d)});return d;},function testReadAPI_getValue(t){var _59=_3.data.tests.stores.KeyValueStore.getDatasource("stores/movies.csv");var _5a=new _3.data.KeyValueStore(_59);var d=new doh.Deferred();function _5b(_5c){t.assertTrue(_5c!==null);t.is("nday",_5a.getValue(_5c,"key"));t.is(1,_5a.getValue(_5c,"value"));t.is(1,_5a.getValue(_5c,"nday"));d.callback(true);};_5a.fetchItemByIdentity({identity:"nday",onItem:_5b,onError:_1.partial(_3.data.tests.stores.KeyValueStore.error,t,d)});return d;},function testReadAPI_getValue_2(t){var _5d=_3.data.tests.stores.KeyValueStore.getDatasource("stores/movies.csv");var _5e=new _3.data.KeyValueStore(_5d);var d=new doh.Deferred();function _5f(_60){t.assertTrue(_60!==null);t.is("day",_5e.getValue(_60,"key"));t.is("Saturday",_5e.getValue(_60,"value"));t.is("Saturday",_5e.getValue(_60,"day"));d.callback(true);};_5e.fetchItemByIdentity({identity:"day",onItem:_5f,onError:_1.partial(_3.data.tests.stores.KeyValueStore.error,t,d)});return d;},function testReadAPI_getValue_3(t){var _61=_3.data.tests.stores.KeyValueStore.getDatasource("stores/movies.csv");var _62=new _3.data.KeyValueStore(_61);var d=new doh.Deferred();function _63(_64){t.assertTrue(_64!==null);t.is("dayOfYear",_62.getValue(_64,"key"));t.is(335,_62.getValue(_64,"value"));t.is(335,_62.getValue(_64,"dayOfYear"));d.callback(true);};_62.fetchItemByIdentity({identity:"dayOfYear",onItem:_63,onError:_1.partial(_3.data.tests.stores.KeyValueStore.error,t,d)});return d;},function testReadAPI_getValue_4(t){var _65=_3.data.tests.stores.KeyValueStore.getDatasource("stores/movies.csv");var _66=new _3.data.KeyValueStore(_65);var d=new doh.Deferred();function _67(_68){t.assertTrue(_68!==null);t.is("weekOfYear",_66.getValue(_68,"key"));t.is(48,_66.getValue(_68,"value"));t.is(48,_66.getValue(_68,"weekOfYear"));d.callback(true);};_66.fetchItemByIdentity({identity:"weekOfYear",onItem:_67,onError:_1.partial(_3.data.tests.stores.KeyValueStore.error,t,d)});return d;},function testReadAPI_getValues(t){var _69=_3.data.tests.stores.KeyValueStore.getDatasource("stores/movies.csv");var _6a=new _3.data.KeyValueStore(_69);var d=new doh.Deferred();function _6b(_6c){t.assertTrue(_6c!==null);var _6d=_6a.getValues(_6c,"year");t.assertTrue(_1.isArray(_6d));t.is(1,_6d.length);t.is(2007,_6d[0]);d.callback(true);};_6a.fetchItemByIdentity({identity:"year",onItem:_6b,onError:_1.partial(_3.data.tests.stores.KeyValueStore.error,t,d)});return d;},function testIdentityAPI_fetchItemByIdentity(t){var _6e=_3.data.tests.stores.KeyValueStore.getDatasource("stores/movies.csv");var _6f=new _3.data.KeyValueStore(_6e);var d=new doh.Deferred();function _70(_71){t.assertTrue(_71!==null);d.callback(true);};_6f.fetchItemByIdentity({identity:"year",onItem:_70,onError:_1.partial(_3.data.tests.stores.KeyValueStore.error,t,d)});return d;},function testIdentityAPI_fetchItemByIdentity_bad1(t){var _72=_3.data.tests.stores.KeyValueStore.getDatasource("stores/movies.csv");var _73=new _3.data.KeyValueStore(_72);var d=new doh.Deferred();function _74(_75){t.assertTrue(_75===null);d.callback(true);};_73.fetchItemByIdentity({identity:"y3ar",onItem:_74,onError:_1.partial(_3.data.tests.stores.KeyValueStore.error,t,d)});return d;},function testIdentityAPI_fetchItemByIdentity_bad2(t){var _76=_3.data.tests.stores.KeyValueStore.getDatasource("stores/movies.csv");var _77=new _3.data.KeyValueStore(_76);var d=new doh.Deferred();function _78(_79){t.assertTrue(_79===null);d.callback(true);};_77.fetchItemByIdentity({identity:"-1",onItem:_78,onError:_1.partial(_3.data.tests.stores.KeyValueStore.error,t,d)});return d;},function testIdentityAPI_fetchItemByIdentity_bad3(t){var _7a=_3.data.tests.stores.KeyValueStore.getDatasource("stores/movies.csv");var _7b=new _3.data.KeyValueStore(_7a);var d=new doh.Deferred();function _7c(_7d){t.assertTrue(_7d===null);d.callback(true);};_7b.fetchItemByIdentity({identity:"999999",onItem:_7c,onError:_1.partial(_3.data.tests.stores.KeyValueStore.error,t,d)});return d;},function testIdentityAPI_getIdentity(t){var _7e=_3.data.tests.stores.KeyValueStore.getDatasource("stores/movies.csv");var _7f=new _3.data.KeyValueStore(_7e);var d=new doh.Deferred();function _80(_81,_82){t.is(7,_81.length);t.is(_7f.getIdentity(_81[0]),"year");t.is(_7f.getIdentity(_81[1]),"nmonth");t.is(_7f.getIdentity(_81[2]),"month");t.is(_7f.getIdentity(_81[3]),"nday");t.is(_7f.getIdentity(_81[4]),"day");t.is(_7f.getIdentity(_81[5]),"dayOfYear");t.is(_7f.getIdentity(_81[6]),"weekOfYear");d.callback(true);};_7f.fetch({onComplete:_80,onError:_1.partial(_3.data.tests.stores.KeyValueStore.error,t,d)});return d;},function testIdentityAPI_getIdentityAttributes(t){var _83=_3.data.tests.stores.KeyValueStore.getDatasource("stores/movies.csv");var _84=new _3.data.KeyValueStore(_83);var d=new doh.Deferred();function _85(_86){t.assertTrue(_84.isItem(_86));t.assertEqual("key",_84.getIdentityAttributes(_86));d.callback(true);};_84.fetchItemByIdentity({identity:"year",onItem:_85,onError:_1.partial(_3.data.tests.stores.KeyValueStore.error,t,d)});return d;},function testReadAPI_isItem(t){var _87=_3.data.tests.stores.KeyValueStore.getDatasource("stores/movies.csv");var _88=new _3.data.KeyValueStore(_87);var d=new doh.Deferred();function _89(_8a){t.assertTrue(_88.isItem(_8a));t.assertTrue(!_88.isItem({}));t.assertTrue(!_88.isItem({item:"not an item"}));t.assertTrue(!_88.isItem("not an item"));t.assertTrue(!_88.isItem(["not an item"]));d.callback(true);};_88.fetchItemByIdentity({identity:"year",onItem:_89,onError:_1.partial(_3.data.tests.stores.KeyValueStore.error,t,d)});return d;},function testReadAPI_hasAttribute(t){var _8b=_3.data.tests.stores.KeyValueStore.getDatasource("stores/movies.csv");var _8c=new _3.data.KeyValueStore(_8b);var d=new doh.Deferred();function _8d(_8e){t.assertTrue(_8e!==null);t.assertTrue(_8c.hasAttribute(_8e,"key"));t.assertTrue(_8c.hasAttribute(_8e,"value"));t.assertTrue(_8c.hasAttribute(_8e,"year"));t.assertTrue(!_8c.hasAttribute(_8e,"Year"));t.assertTrue(!_8c.hasAttribute(_8e,"Nothing"));t.assertTrue(!_8c.hasAttribute(_8e,"Title"));var _8f=false;try{_8c.hasAttribute(_8e,null);}catch(e){_8f=true;}t.assertTrue(_8f);d.callback(true);};_8c.fetchItemByIdentity({identity:"year",onItem:_8d,onError:_1.partial(_3.data.tests.stores.KeyValueStore.error,t,d)});return d;},function testReadAPI_containsValue(t){var _90=_3.data.tests.stores.KeyValueStore.getDatasource("stores/movies.csv");var _91=new _3.data.KeyValueStore(_90);var d=new doh.Deferred();function _92(_93){t.assertTrue(_93!==null);t.assertTrue(_91.containsValue(_93,"year","2007"));t.assertTrue(_91.containsValue(_93,"value","2007"));t.assertTrue(_91.containsValue(_93,"key","year"));t.assertTrue(!_91.containsValue(_93,"Title","Alien2"));t.assertTrue(!_91.containsValue(_93,"Year","1979   "));t.assertTrue(!_91.containsValue(_93,"Title",null));var _94=false;try{_91.containsValue(_93,null,"foo");}catch(e){_94=true;}t.assertTrue(_94);d.callback(true);};_91.fetchItemByIdentity({identity:"year",onItem:_92,onError:_1.partial(_3.data.tests.stores.KeyValueStore.error,t,d)});return d;},function testReadAPI_getAttributes(t){var _95=_3.data.tests.stores.KeyValueStore.getDatasource("stores/movies.csv");var _96=new _3.data.KeyValueStore(_95);var d=new doh.Deferred();function _97(_98){t.assertTrue(_98!==null);t.assertTrue(_96.isItem(_98));var _99=_96.getAttributes(_98);t.is(3,_99.length);for(var i=0;i<_99.length;i++){t.assertTrue((_99[i]==="year"||_99[i]==="value"||_99[i]==="key"));}d.callback(true);};_96.fetchItemByIdentity({identity:"year",onItem:_97,onError:_1.partial(_3.data.tests.stores.KeyValueStore.error,t,d)});return d;},function testReadAPI_getAttributes_onlyTwo(t){var _9a=_3.data.tests.stores.KeyValueStore.getDatasource("stores/movies.csv");var _9b=new _3.data.KeyValueStore(_9a);var d=new doh.Deferred();function _9c(_9d){t.assertTrue(_9d!==null);t.assertTrue(_9b.isItem(_9d));var _9e=_9b.getAttributes(_9d);t.assertTrue(_9e.length===3);t.assertTrue(_9e[0]==="key");t.assertTrue(_9e[1]==="value");t.assertTrue(_9e[2]==="nmonth");d.callback(true);};_9b.fetchItemByIdentity({identity:"nmonth",onItem:_9c,onError:_1.partial(_3.data.tests.stores.KeyValueStore.error,t,d)});return d;},function testReadAPI_getFeatures(t){var _9f=_3.data.tests.stores.KeyValueStore.getDatasource("stores/movies.csv");var _a0=new _3.data.KeyValueStore(_9f);var _a1=_a0.getFeatures();var _a2=0;for(i in _a1){t.assertTrue((i==="dojo.data.api.Read"||i==="dojo.data.api.Identity"));_a2++;}t.assertTrue(_a2===2);},function testReadAPI_fetch_patternMatch0(t){var _a3=_3.data.tests.stores.KeyValueStore.getDatasource("stores/movies.csv");var _a4=new _3.data.KeyValueStore(_a3);var d=new doh.Deferred();function _a5(_a6,_a7){t.is(2,_a6.length);var _a8=["nmonth","month"];t.assertTrue(_3.data.tests.stores.KeyValueStore.verifyItems(_a4,_a6,"key",_a8));d.callback(true);};_a4.fetch({query:{key:"*month"},onComplete:_a5,onError:_1.partial(_3.data.tests.stores.KeyValueStore.error,t,d)});return d;},function testReadAPI_fetch_patternMatch1(t){var _a9=_3.data.tests.stores.KeyValueStore.getDatasource("stores/patterns.csv");var _aa=new _3.data.KeyValueStore(_a9);var d=new doh.Deferred();function _ab(_ac,_ad){t.assertTrue(_ac.length===2);var _ae=["1","Saturday"];t.assertTrue(_3.data.tests.stores.KeyValueStore.verifyItems(_aa,_ac,"value",_ae));d.callback(true);};_aa.fetch({query:{key:"*day"},onComplete:_ab,onError:_1.partial(_3.data.tests.stores.KeyValueStore.error,t,d)});return d;},function testReadAPI_fetch_patternMatch2(t){var _af=_3.data.tests.stores.KeyValueStore.getDatasource("stores/patterns.csv");var _b0=new _3.data.KeyValueStore(_af);var d=new doh.Deferred();function _b1(_b2,_b3){t.is(2,_b2.length);t.assertTrue(_b0.getValue(_b2[0],"value")==="12");t.assertTrue(_b0.getValue(_b2[0],"key")==="nmonth");t.assertTrue(_b0.getValue(_b2[1],"value")==="1");t.assertTrue(_b0.getValue(_b2[1],"key")==="nday");d.callback(true);};_b0.fetch({query:{value:"1*"},onComplete:_b1,onError:_1.partial(_3.data.tests.stores.KeyValueStore.error,t,d)});return d;},function testReadAPI_fetch_patternMatch_caseInsensitive(t){var _b4=_3.data.tests.stores.KeyValueStore.getDatasource("stores/patterns.csv");var _b5=new _3.data.KeyValueStore(_b4);var d=new doh.Deferred();function _b6(_b7,_b8){t.is(1,_b7.length);t.assertTrue(_b5.getValue(_b7[0],"value")==="December");d.callback(true);};_b5.fetch({query:{key:"MONth"},queryOptions:{ignoreCase:true},onComplete:_b6,onError:_1.partial(_3.data.tests.stores.KeyValueStore.error,t,d)});return d;},function testReadAPI_fetch_patternMatch_caseSensitive(t){var _b9=_3.data.tests.stores.KeyValueStore.getDatasource("stores/patterns.csv");var _ba=new _3.data.KeyValueStore(_b9);var d=new doh.Deferred();function _bb(_bc,_bd){t.is(0,_bc.length);d.callback(true);};_ba.fetch({query:{value:"DECEMberO"},queryOptions:{ignoreCase:false},onComplete:_bb,onError:_1.partial(_3.data.tests.stores.KeyValueStore.error,t,d)});return d;},function testReadAPI_fetch_sortAlphabetic(t){var _be=_3.data.tests.stores.KeyValueStore.getDatasource("stores/patterns.csv");var _bf=new _3.data.KeyValueStore(_be);var d=new doh.Deferred();function _c0(_c1,_c2){var _c3=["day","dayOfYear","month","nday","nmonth","weekOfYear","year"];t.is(7,_c1.length);t.assertTrue(_3.data.tests.stores.KeyValueStore.verifyItems(_bf,_c1,"key",_c3));d.callback(true);};var _c4=[{attribute:"key"}];_bf.fetch({sort:_c4,onComplete:_c0,onError:_1.partial(_3.data.tests.stores.KeyValueStore.error,t,d)});return d;},function testReadAPI_fetch_sortAlphabeticDescending(t){var _c5=_3.data.tests.stores.KeyValueStore.getDatasource("stores/patterns.csv");var _c6=new _3.data.KeyValueStore(_c5);var d=new doh.Deferred();function _c7(_c8,_c9){var _ca=["year","weekOfYear","nmonth","nday","month","dayOfYear","day"];t.is(7,_c8.length);t.assertTrue(_3.data.tests.stores.KeyValueStore.verifyItems(_c6,_c8,"key",_ca));d.callback(true);};var _cb=[{attribute:"key",descending:true}];_c6.fetch({sort:_cb,onComplete:_c7,onError:_1.partial(_3.data.tests.stores.KeyValueStore.error,t,d)});return d;},function testReadAPI_fetch_sortMultiple(t){var _cc=_3.data.tests.stores.KeyValueStore.getDatasource("stores/patterns.csv");var _cd=new _3.data.KeyValueStore(_cc);var d=new doh.Deferred();function _ce(_cf,_d0){var _d1=["123abc","123abc","123abc","123abcdefg","BaBaMaSaRa***Foo","bar*foo","bit$Bite","foo*bar","jfq4@#!$!@Rf14r14i5u",undefined];var _d2=["day","dayOfYear","month","nday","nmonth","weekOfYear","year"];var _d1=["Saturday","335","December","1","12","48","2007"];t.is(7,_cf.length);t.assertTrue(_3.data.tests.stores.KeyValueStore.verifyItems(_cd,_cf,"key",_d2));t.assertTrue(_3.data.tests.stores.KeyValueStore.verifyItems(_cd,_cf,"value",_d1));d.callback(true);};var _d3=[{attribute:"key"},{attribute:"value",descending:true}];_cd.fetch({sort:_d3,onComplete:_ce,onError:_1.partial(_3.data.tests.stores.KeyValueStore.error,t,d)});return d;},function testReadAPI_fetch_sortMultipleSpecialComparator(t){var _d4=_3.data.tests.stores.KeyValueStore.getDatasource("stores/movies.csv");var _d5=new _3.data.KeyValueStore(_d4);_d5.comparatorMap={};_d5.comparatorMap["key"]=function(a,b){var ret=0;function _d6(_d7){if(typeof _d7==="undefined"){return undefined;}return _d7.slice(_d7.length-1);};var _d8=_d6(a);var _d9=_d6(b);if(_d8>_d9||typeof _d8==="undefined"){ret=1;}else{if(_d8<_d9||typeof _d9==="undefined"){ret=-1;}}return ret;};var _da=[{attribute:"key",descending:true},{attribute:"value",descending:true}];var d=new doh.Deferred();function _db(_dc,_dd){var _de=[5,4,0,3,2,1,6];var _de=["day","nday","weekOfYear","dayOfYear","year","month","nmonth"];t.assertTrue(_dc.length===7);var _df=true;for(var i=0;i<_dc.length;i++){if(!(_d5.getIdentity(_dc[i])===_de[i])){_df=false;break;}}t.assertTrue(_df);d.callback(true);};_d5.fetch({sort:_da,onComplete:_db,onError:_1.partial(_3.data.tests.stores.KeyValueStore.error,t,d)});return d;},function testReadAPI_functionConformance(t){var _e0=new _3.data.KeyValueStore(_3.data.tests.stores.KeyValueStore.getDatasource("stores/movies.csv"));var _e1=new _1.data.api.Read();var _e2=true;for(i in _e1){if(i.toString().charAt(0)!=="_"){var _e3=_e1[i];if(typeof _e3==="function"){var _e4=_e0[i];if(!(typeof _e4==="function")){_e2=false;break;}}}}t.assertTrue(_e2);},function testIdentityAPI_functionConformance(t){var _e5=new _3.data.KeyValueStore(_3.data.tests.stores.KeyValueStore.getDatasource("stores/movies.csv"));var _e6=new _1.data.api.Identity();var _e7=true;for(i in _e6){if(i.toString().charAt(0)!=="_"){var _e8=_e6[i];if(typeof _e8==="function"){var _e9=_e5[i];if(!(typeof _e9==="function")){_e7=false;break;}}}}t.assertTrue(_e7);}]);});require(["dojox/data/tests/stores/KeyValueStore"]);