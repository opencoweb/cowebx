/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/data/PicasaStore","dojo/data/api/Read"],function(_1,_2,_3){_1.getObject("dojox.data.tests.stores.PicasaStore",1);_3.data.tests.stores.PicasaStore.error=function(t,d,_4){d.errback(_4);};doh.register("dojox.data.tests.stores.PicasaStore",[{name:"ReadAPI:  Fetch_One",timeout:10000,runTest:function(t){var _5=new _3.data.PicasaStore();var d=new doh.Deferred();function _6(_7,_8){t.is(1,_7.length);d.callback(true);};_5.fetch({query:{tags:"animals"},count:1,onComplete:_6,onError:_1.partial(_3.data.tests.stores.PicasaStore.error,doh,d)});return d;}},{name:"ReadAPI:  Fetch_20_Streaming",timeout:10000,runTest:function(t){var _9=new _3.data.PicasaStore();var d=new doh.Deferred();var _a=0;function _b(_c,_d){t.is(20,_c);};function _e(_f,_10){t.assertTrue(_9.isItem(_f));_a++;};function _11(_12,_13){t.is(20,_a);t.is(null,_12);d.callback(true);};_9.fetch({onBegin:_b,count:20,onItem:_e,onComplete:_11,onError:_1.partial(_3.data.tests.stores.PicasaStore.error,t,d)});return d;}},{name:"ReadAPI:  Fetch_Paging",timeout:30000,runTest:function(t){var _14=new _3.data.PicasaStore();var d=new doh.Deferred();function _15(_16,_17){t.is(18,_16.length);d.callback(true);};function _18(_19,_1a){t.is(11,_19.length);_1a.start=2;_1a.count=20;_1a.onComplete=_15;_14.fetch(_1a);};function _1b(_1c,_1d){t.is(18,_1c.length);_1d.start=9;_1d.count=100;_1d.onComplete=_18;_14.fetch(_1d);};function _1e(_1f,_20){t.is(5,_1f.length);_20.start=2;_20.count=20;_20.onComplete=_1b;_14.fetch(_20);};function _21(_22,_23){t.is(1,_22.length);_23.start=0;_23.count=5;_23.onComplete=_1e;_14.fetch(_23);};function _24(_25,_26){t.is(5,_25.length);_26.start=3;_26.count=1;_26.onComplete=_21;_14.fetch(_26);};function _27(_28,_29){t.is(7,_28.length);_29.start=1;_29.count=5;_29.onComplete=_24;_14.fetch(_29);};_14.fetch({count:7,onComplete:_27,onError:_1.partial(_3.data.tests.stores.PicasaStore.error,t,d)});return d;}},{name:"ReadAPI:  getLabel",timeout:10000,runTest:function(t){var _2a=new _3.data.PicasaStore();var d=new doh.Deferred();function _2b(_2c,_2d){t.assertEqual(_2c.length,1);var _2e=_2a.getLabel(_2c[0]);t.assertTrue(_2e!==null);d.callback(true);};_2a.fetch({query:{tags:"animals"},count:1,onComplete:_2b,onError:_1.partial(_3.data.tests.stores.PicasaStore.error,t,d)});return d;}},{name:"ReadAPI:  getLabelAttributes",timeout:10000,runTest:function(t){var _2f=new _3.data.PicasaStore();var d=new doh.Deferred();function _30(_31,_32){t.assertEqual(_31.length,1);var _33=_2f.getLabelAttributes(_31[0]);t.assertTrue(_1.isArray(_33));t.assertEqual("title",_33[0]);d.callback(true);};_2f.fetch({query:{tags:"animals"},count:1,onComplete:_30,onError:_1.partial(_3.data.tests.stores.PicasaStore.error,t,d)});return d;}},{name:"ReadAPI:  getValue",timeout:10000,runTest:function(t){var _34=new _3.data.PicasaStore();var d=new doh.Deferred();function _35(_36){t.is(1,_36.length);t.assertTrue(_34.getValue(_36[0],"title")!==null);t.assertTrue(_34.getValue(_36[0],"imageUrl")!==null);t.assertTrue(_34.getValue(_36[0],"imageUrlSmall")!==null);t.assertTrue(_34.getValue(_36[0],"imageUrlMedium")!==null);d.callback(true);};_34.fetch({count:1,onComplete:_35,onError:_1.partial(_3.data.tests.stores.PicasaStore.error,t,d)});return d;}},{name:"ReadAPI:  getValues",timeout:10000,runTest:function(t){var _37=new _3.data.PicasaStore();var d=new doh.Deferred();function _38(_39){t.is(1,_39.length);t.assertTrue(_37.getValues(_39[0],"title") instanceof Array);t.assertTrue(_37.getValues(_39[0],"description") instanceof Array);t.assertTrue(_37.getValues(_39[0],"imageUrl") instanceof Array);t.assertTrue(_37.getValues(_39[0],"imageUrlSmall") instanceof Array);t.assertTrue(_37.getValues(_39[0],"imageUrlMedium") instanceof Array);d.callback(true);};_37.fetch({count:1,onComplete:_38,onError:_1.partial(_3.data.tests.stores.PicasaStore.error,t,d)});return d;}},{name:"ReadAPI:  isItem",timeout:10000,runTest:function(t){var _3a=new _3.data.PicasaStore();var d=new doh.Deferred();function _3b(_3c){t.is(5,_3c.length);for(var i=0;i<_3c.length;i++){t.assertTrue(_3a.isItem(_3c[i]));}d.callback(true);};_3a.fetch({count:5,onComplete:_3b,onError:_1.partial(_3.data.tests.stores.PicasaStore.error,t,d)});return d;}},{name:"ReadAPI:  hasAttribute",timeout:10000,runTest:function(t){var _3d=new _3.data.PicasaStore();var d=new doh.Deferred();function _3e(_3f){t.is(1,_3f.length);t.assertTrue(_3f[0]!==null);t.assertTrue(_3d.hasAttribute(_3f[0],"title"));t.assertTrue(_3d.hasAttribute(_3f[0],"author"));t.assertTrue(!_3d.hasAttribute(_3f[0],"Nothing"));t.assertTrue(!_3d.hasAttribute(_3f[0],"Text"));var _40=false;try{_3d.hasAttribute(_3f[0],null);}catch(e){_40=true;}t.assertTrue(_40);d.callback(true);};_3d.fetch({query:{tags:"animals"},count:1,onComplete:_3e,onError:_1.partial(_3.data.tests.stores.PicasaStore.error,t,d)});return d;}},{name:"ReadAPI:  containsValue",timeout:10000,runTest:function(t){var _41=new _3.data.PicasaStore();var d=new doh.Deferred();function _42(_43){t.is(1,_43.length);d.callback(true);};_41.fetch({query:{tags:"animals"},count:1,onComplete:_42,onError:_1.partial(_3.data.tests.stores.PicasaStore.error,t,d)});return d;}},{name:"ReadAPI:  getAttributes",timeout:10000,runTest:function(t){var _44=new _3.data.PicasaStore();var d=new doh.Deferred();function _45(_46){t.is(1,_46.length);t.assertTrue(_44.isItem(_46[0]));var _47=_44.getAttributes(_46[0]);t.is(21,_47.length);d.callback(true);};_44.fetch({count:1,onComplete:_45,onError:_1.partial(_3.data.tests.stores.PicasaStore.error,t,d)});return d;}},function testReadAPI_getFeatures(t){var _48=new _3.data.PicasaStore();var _49=_48.getFeatures();var _4a=0;var i;for(i in _49){t.assertTrue((i==="dojo.data.api.Read"));_4a++;}t.assertTrue(_4a===1);},function testReadAPI_functionConformance(t){var _4b=new _3.data.PicasaStore();var _4c=new _1.data.api.Read();var _4d=true;var i;for(i in _4c){if(i.toString().charAt(0)!=="_"){var _4e=_4c[i];if(typeof _4e==="function"){var _4f=_4b[i];if(!(typeof _4f==="function")){_4d=false;break;}}}}t.assertTrue(_4d);}]);});require(["dojox/data/tests/stores/PicasaStore"]);