/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojox/data/OpenSearchStore","dojo/data/api/Read"],function(_1,_2,_3){_1.getObject("dojox.data.tests.stores.OpenSearchStore",1);_3.data.tests.stores.OpenSearchStore.getAtomStore=function(){var _4=new _3.data.OpenSearchStore({url:_1.moduleUrl("dojox.data.tests.stores","opensearch_atom.xml").toString()});_4._createSearchUrl=function(_5){return _1.moduleUrl("dojox.data.tests.stores","atom1.xml").toString();};return _4;};_3.data.tests.stores.OpenSearchStore.getRSSStore=function(){var _6=new _3.data.OpenSearchStore({url:_1.moduleUrl("dojox.data.tests.stores","opensearch_rss.xml").toString()});_6._createSearchUrl=function(_7){return _1.moduleUrl("dojox.data.tests.stores","rss1.xml").toString();};return _6;};_3.data.tests.stores.OpenSearchStore.getHTMLStore=function(){var _8=new _3.data.OpenSearchStore({url:_1.moduleUrl("dojox.data.tests.stores","opensearch_html.xml").toString(),itemPath:"table tbody tr"});_8._createSearchUrl=function(_9){return _1.moduleUrl("dojox.data.tests.stores","books.html").toString();};return _8;};doh.register("dojox.data.tests.stores.OpenSearchStore",[{name:"testReadAPI_fetch_all_atom",timeout:20000,runTest:function(t){var _a=_3.data.tests.stores.OpenSearchStore.getAtomStore();var d=new doh.Deferred();function _b(_c,_d){t.assertEqual(20,_c.length);d.callback(true);};function _e(_f,_10){d.errback(_f);};_a.fetch({onComplete:_b,onError:_e});return d;}},{name:"testReadAPI_fetch_all_rss",timeout:20000,runTest:function(t){var _11=_3.data.tests.stores.OpenSearchStore.getRSSStore();var d=new doh.Deferred();function _12(_13,_14){t.assertEqual(20,_13.length);d.callback(true);};function _15(_16,_17){d.errback(_16);};_11.fetch({onComplete:_12,onError:_15});return d;}},{name:"testReadAPI_fetch_all_html",timeout:20000,runTest:function(t){var _18=_3.data.tests.stores.OpenSearchStore.getHTMLStore();var d=new doh.Deferred();function _19(_1a,_1b){t.assertEqual(20,_1a.length);d.callback(true);};function _1c(_1d,_1e){d.errback(_1d);};_18.fetch({onComplete:_19,onError:_1c});return d;}},{name:"testReadAPI_fetch_paging_atom",timeout:20000,runTest:function(t){var _1f=_3.data.tests.stores.OpenSearchStore.getAtomStore();var d=new doh.Deferred();function _20(_21,_22){t.assertEqual(0,_21.length);d.callback(true);};function _23(_24,_25){t.assertEqual(18,_24.length);_25.start=20;_25.count=100;_25.onComplete=_20;_1f.fetch(_25);};function _26(_27,_28){t.assertEqual(5,_27.length);_28.start=2;_28.count=20;_28.onComplete=_23;_1f.fetch(_28);};function _29(_2a,_2b){t.assertEqual(1,_2a.length);_2b.start=0;_2b.count=5;_2b.onComplete=_26;_1f.fetch(_2b);};function _2c(_2d,_2e){t.assertEqual(5,_2d.length);_2e.start=3;_2e.count=1;_2e.onComplete=_29;_1f.fetch(_2e);};function _2f(_30,_31){t.assertEqual(20,_30.length);_31.start=1;_31.count=5;_31.onComplete=_2c;_1f.fetch(_31);};function _32(_33,_34){d.errback(_33);};_1f.fetch({onComplete:_2f,onError:_32});return d;}},{name:"testReadAPI_fetch_paging_rss",timeout:20000,runTest:function(t){var _35=_3.data.tests.stores.OpenSearchStore.getRSSStore();var d=new doh.Deferred();function _36(_37,_38){t.assertEqual(0,_37.length);d.callback(true);};function _39(_3a,_3b){t.assertEqual(18,_3a.length);_3b.start=20;_3b.count=100;_3b.onComplete=_36;_35.fetch(_3b);};function _3c(_3d,_3e){t.assertEqual(5,_3d.length);_3e.start=2;_3e.count=20;_3e.onComplete=_39;_35.fetch(_3e);};function _3f(_40,_41){t.assertEqual(1,_40.length);_41.start=0;_41.count=5;_41.onComplete=_3c;_35.fetch(_41);};function _42(_43,_44){t.assertEqual(5,_43.length);_44.start=3;_44.count=1;_44.onComplete=_3f;_35.fetch(_44);};function _45(_46,_47){t.assertEqual(20,_46.length);_47.start=1;_47.count=5;_47.onComplete=_42;_35.fetch(_47);};function _48(_49,_4a){d.errback(_49);};_35.fetch({onComplete:_45,onError:_48});return d;}},{name:"testReadAPI_fetch_paging_html",timeout:20000,runTest:function(t){var _4b=_3.data.tests.stores.OpenSearchStore.getHTMLStore();var d=new doh.Deferred();function _4c(_4d,_4e){t.assertEqual(10,_4d.length);d.callback(true);};function _4f(_50,_51){t.assertEqual(18,_50.length);_51.start=10;_51.count=100;_51.onComplete=_4c;_4b.fetch(_51);};function _52(_53,_54){t.assertEqual(5,_53.length);_54.start=2;_54.count=20;_54.onComplete=_4f;_4b.fetch(_54);};function _55(_56,_57){t.assertEqual(1,_56.length);_57.start=0;_57.count=5;_57.onComplete=_52;_4b.fetch(_57);};function _58(_59,_5a){t.assertEqual(5,_59.length);_5a.start=3;_5a.count=1;_5a.onComplete=_55;_4b.fetch(_5a);};function _5b(_5c,_5d){t.assertEqual(20,_5c.length);_5d.start=1;_5d.count=5;_5d.onComplete=_58;_4b.fetch(_5d);};function _5e(_5f,_60){d.errback(_5f);};_4b.fetch({onComplete:_5b,onError:_5e});return d;}},{name:"testReadAPI_getLabel",timeout:20000,runTest:function(t){var _61=_3.data.tests.stores.OpenSearchStore.getAtomStore();var d=new doh.Deferred();function _62(_63,_64){t.assertEqual(_63.length,20);var _65=_61.getLabel(_63[0]);t.assertTrue(_65===undefined);d.callback(true);};function _66(_67,_68){d.errback(_67);};_61.fetch({onComplete:_62,onError:_66});return d;}},{name:"testReadAPI_getLabelAttributes",timeout:20000,runTest:function(t){var _69=_3.data.tests.stores.OpenSearchStore.getAtomStore();var d=new doh.Deferred();function _6a(_6b,_6c){t.assertEqual(_6b.length,20);var _6d=_69.getLabelAttributes(_6b[0]);t.assertTrue(!_1.isArray(_6d));t.assertTrue(_6d===null);d.callback(true);};function _6e(_6f,_70){d.errback(_6f);};_69.fetch({onComplete:_6a,onError:_6e});return d;}},{name:"testReadAPI_getValue_atom",timeout:20000,runTest:function(t){var _71=_3.data.tests.stores.OpenSearchStore.getAtomStore();var d=new doh.Deferred();function _72(_73,_74){t.assertEqual(20,_73.length);var _75=_73[0];t.assertEqual(_75.node.nodeName,"entry");var id=_75.node.getElementsByTagName("id");t.assertEqual(id.length,1);t.assertEqual(_3.xml.parser.textContent(id[0]),"http://shaneosullivan.wordpress.com/2008/01/22/using-aol-hosted-dojo-with-your-custom-code/");t.assertTrue(_71.hasAttribute(_75,"content"));t.assertEqual(_71.getValue(_75,"content").length,6624);d.callback(true);};function _76(_77,_78){d.errback(_77);};_71.fetch({onComplete:_72,onError:_76});return d;}},{name:"testReadAPI_getValue_rss",timeout:20000,runTest:function(t){var _79=_3.data.tests.stores.OpenSearchStore.getRSSStore();var d=new doh.Deferred();function _7a(_7b,_7c){t.assertEqual(20,_7b.length);var _7d=_7b[0];t.assertEqual(_7d.node.nodeName,"item");var _7e=_7d.node.getElementsByTagName("link");t.assertEqual(_7e.length,3);t.assertEqual(_3.xml.parser.textContent(_7e[0]),"http://shaneosullivan.wordpress.com/2008/01/22/using-aol-hosted-dojo-with-your-custom-code/");t.assertTrue(_79.hasAttribute(_7d,"content"));t.assertEqual(_79.getValue(_7d,"content").length,315);d.callback(true);};function _7f(_80,_81){d.errback(_80);};_79.fetch({onComplete:_7a,onError:_7f});return d;}},{name:"testReadAPI_getValue_html",timeout:20000,runTest:function(t){var _82=_3.data.tests.stores.OpenSearchStore.getHTMLStore();var d=new doh.Deferred();function _83(_84,_85){t.assertEqual(20,_84.length);var _86=_84[0];t.assertEqual(_86.node.nodeName,"TR");var td=_86.node.getElementsByTagName("td");t.assertEqual(td.length,3);t.assertEqual(_3.xml.parser.textContent(td[0]),"1");t.assertEqual(_3.xml.parser.textContent(td[1]),"Title of 1");t.assertEqual(_3.xml.parser.textContent(td[2]),"Author of 1");t.assertTrue(_82.hasAttribute(_86,"content"));t.assertEqual(_82.getValue(_86,"content").length,_1.isIE?53:64);d.callback(true);};function _87(_88,_89){d.errback(_88);};_82.fetch({onComplete:_83,onError:_87});return d;}},{name:"testReadAPI_getValues_atom",timeout:20000,runTest:function(t){var _8a=_3.data.tests.stores.OpenSearchStore.getAtomStore();var d=new doh.Deferred();function _8b(_8c,_8d){t.assertEqual(20,_8c.length);var _8e=_8c[0];t.assertEqual(_8e.node.nodeName,"entry");t.assertTrue(_8a.hasAttribute(_8e,"content"));var _8f=_8a.getValues(_8e,"content");t.assertEqual(1,_8f.length);t.assertEqual(_8a.getValue(_8e,"content").length,6624);d.callback(true);};function _90(_91,_92){d.errback(_91);};_8a.fetch({onComplete:_8b,onError:_90});return d;}},{name:"testReadAPI_getValues_rss",timeout:20000,runTest:function(t){var _93=_3.data.tests.stores.OpenSearchStore.getRSSStore();var d=new doh.Deferred();function _94(_95,_96){t.assertEqual(20,_95.length);var _97=_95[0];t.assertEqual(_97.node.nodeName,"item");t.assertTrue(_93.hasAttribute(_97,"content"));var _98=_93.getValues(_97,"content");t.assertEqual(1,_98.length);t.assertEqual(_93.getValue(_97,"content").length,315);d.callback(true);};function _99(_9a,_9b){d.errback(_9a);};_93.fetch({onComplete:_94,onError:_99});return d;}},{name:"testReadAPI_getValues_html",timeout:20000,runTest:function(t){var _9c=_3.data.tests.stores.OpenSearchStore.getHTMLStore();var d=new doh.Deferred();function _9d(_9e,_9f){t.assertEqual(20,_9e.length);var _a0=_9e[0];t.assertEqual(_a0.node.nodeName,"TR");t.assertTrue(_9c.hasAttribute(_a0,"content"));var _a1=_9c.getValues(_a0,"content");t.assertEqual(1,_a1.length);t.assertEqual(_9c.getValue(_a0,"content").length,_1.isIE?53:64);d.callback(true);};function _a2(_a3,_a4){d.errback(_a3);};_9c.fetch({onComplete:_9d,onError:_a2});return d;}},{name:"testReadAPI_isItem_atom",timeout:20000,runTest:function(t){var _a5=_3.data.tests.stores.OpenSearchStore.getAtomStore();var d=new doh.Deferred();function _a6(_a7,_a8){t.assertEqual(20,_a7.length);var _a9=_a7[0];t.assertTrue(_a5.isItem(_a9));t.assertTrue(!_a5.isItem({}));t.assertTrue(!_a5.isItem("Foo"));t.assertTrue(!_a5.isItem(1));d.callback(true);};function _aa(_ab,_ac){d.errback(_ab);};_a5.fetch({onComplete:_a6,onError:_aa});return d;}},{name:"testReadAPI_isItem_rss",timeout:20000,runTest:function(t){var _ad=_3.data.tests.stores.OpenSearchStore.getRSSStore();var d=new doh.Deferred();function _ae(_af,_b0){t.assertEqual(20,_af.length);var _b1=_af[0];t.assertTrue(_ad.isItem(_b1));t.assertTrue(!_ad.isItem({}));t.assertTrue(!_ad.isItem("Foo"));t.assertTrue(!_ad.isItem(1));d.callback(true);};function _b2(_b3,_b4){d.errback(_b3);};_ad.fetch({onComplete:_ae,onError:_b2});return d;}},{name:"testReadAPI_isItem_html",timeout:20000,runTest:function(t){var _b5=_3.data.tests.stores.OpenSearchStore.getHTMLStore();var d=new doh.Deferred();function _b6(_b7,_b8){t.assertEqual(20,_b7.length);var _b9=_b7[0];t.assertTrue(_b5.isItem(_b9));t.assertTrue(!_b5.isItem({}));t.assertTrue(!_b5.isItem("Foo"));t.assertTrue(!_b5.isItem(1));d.callback(true);};function _ba(_bb,_bc){d.errback(_bb);};_b5.fetch({onComplete:_b6,onError:_ba});return d;}},{name:"testReadAPI_isItem_multistore",timeout:20000,runTest:function(t){var _bd=_3.data.tests.stores.OpenSearchStore.getAtomStore();var _be=_3.data.tests.stores.OpenSearchStore.getHTMLStore();var d=new doh.Deferred();function _bf(_c0,_c1){d.errback(_c0);};function _c2(_c3,_c4){t.assertEqual(20,_c3.length);var _c5=_c3[0];t.assertTrue(_bd.isItem(_c5));function _c6(_c7,_c8){t.assertEqual(20,_c7.length);var _c9=_c7[0];t.assertTrue(_be.isItem(_c9));t.assertTrue(!_bd.isItem(_c9));t.assertTrue(!_be.isItem(_c5));d.callback(true);};_be.fetch({onComplete:_c6,onError:_bf});};_bd.fetch({onComplete:_c2,onError:_bf});return d;}},{name:"testReadAPI_hasAttribute_atom",timeout:20000,runTest:function(t){var _ca=_3.data.tests.stores.OpenSearchStore.getAtomStore();var d=new doh.Deferred();function _cb(_cc,_cd){t.assertEqual(20,_cc.length);var _ce=_cc[0];t.assertTrue(_ca.hasAttribute(_ce,"content"));t.assertTrue(!_ca.hasAttribute(_ce,"summary"));t.assertTrue(!_ca.hasAttribute(_ce,"bob"));d.callback(true);};function _cf(_d0,_d1){d.errback(_d0);};_ca.fetch({onComplete:_cb,onError:_cf});return d;}},{name:"testReadAPI_hasAttribute_rss",timeout:20000,runTest:function(t){var _d2=_3.data.tests.stores.OpenSearchStore.getRSSStore();var d=new doh.Deferred();function _d3(_d4,_d5){t.assertEqual(20,_d4.length);var _d6=_d4[0];t.assertTrue(_d2.hasAttribute(_d6,"content"));t.assertTrue(!_d2.hasAttribute(_d6,"summary"));t.assertTrue(!_d2.hasAttribute(_d6,"bob"));d.callback(true);};function _d7(_d8,_d9){d.errback(_d8);};_d2.fetch({onComplete:_d3,onError:_d7});return d;}},{name:"testReadAPI_hasAttribute_html",timeout:20000,runTest:function(t){var _da=_3.data.tests.stores.OpenSearchStore.getHTMLStore();var d=new doh.Deferred();function _db(_dc,_dd){t.assertEqual(20,_dc.length);var _de=_dc[0];t.assertTrue(_da.hasAttribute(_de,"content"));t.assertTrue(!_da.hasAttribute(_de,"summary"));t.assertTrue(!_da.hasAttribute(_de,"bob"));d.callback(true);};function _df(_e0,_e1){d.errback(_e0);};_da.fetch({onComplete:_db,onError:_df});return d;}},{name:"testReadAPI_containsValue_atom",timeout:20000,runTest:function(t){var _e2=_3.data.tests.stores.OpenSearchStore.getAtomStore();var d=new doh.Deferred();function _e3(_e4,_e5){t.assertEqual(20,_e4.length);var _e6=_e4[19];t.assertTrue(_e2.containsValue(_e6,"content","<div class='snap_preview'><br /><p><a href=\"http://billhiggins.us/weblog/about/\" target=\"_blank\">Bill Higgins</a> of IBM has written a very well thought out article of why web applications should look and act like web applications, and not the desktop variety.  Well worth a read - <a href=\"http://billhiggins.us/weblog/2007/05/17/the-uncanny-valley-of-user-interface-design\" target=\"_blank\">http://billhiggins.us/weblog/2007/05/17/the-uncanny-valley-of-user-interface-design</a></p>\n\n<img alt=\"\" border=\"0\" src=\"http://feeds.wordpress.com/1.0/categories/shaneosullivan.wordpress.com/56/\" /> <img alt=\"\" border=\"0\" src=\"http://feeds.wordpress.com/1.0/tags/shaneosullivan.wordpress.com/56/\" /> <a rel=\"nofollow\" href=\"http://feeds.wordpress.com/1.0/gocomments/shaneosullivan.wordpress.com/56/\"><img alt=\"\" border=\"0\" src=\"http://feeds.wordpress.com/1.0/comments/shaneosullivan.wordpress.com/56/\" /></a> <a rel=\"nofollow\" href=\"http://feeds.wordpress.com/1.0/godelicious/shaneosullivan.wordpress.com/56/\"><img alt=\"\" border=\"0\" src=\"http://feeds.wordpress.com/1.0/delicious/shaneosullivan.wordpress.com/56/\" /></a> <a rel=\"nofollow\" href=\"http://feeds.wordpress.com/1.0/gostumble/shaneosullivan.wordpress.com/56/\"><img alt=\"\" border=\"0\" src=\"http://feeds.wordpress.com/1.0/stumble/shaneosullivan.wordpress.com/56/\" /></a> <a rel=\"nofollow\" href=\"http://feeds.wordpress.com/1.0/godigg/shaneosullivan.wordpress.com/56/\"><img alt=\"\" border=\"0\" src=\"http://feeds.wordpress.com/1.0/digg/shaneosullivan.wordpress.com/56/\" /></a> <a rel=\"nofollow\" href=\"http://feeds.wordpress.com/1.0/goreddit/shaneosullivan.wordpress.com/56/\"><img alt=\"\" border=\"0\" src=\"http://feeds.wordpress.com/1.0/reddit/shaneosullivan.wordpress.com/56/\" /></a> <img alt=\"\" border=\"0\" src=\"http://stats.wordpress.com/b.gif?host=shaneosullivan.wordpress.com&blog=258432&post=56&subd=shaneosullivan&ref=&feed=1\" /></div>"));t.assertTrue(!_e2.containsValue(_e6,"content","bob"));d.callback(true);};function _e7(_e8,_e9){d.errback(_e8);};_e2.fetch({onComplete:_e3,onError:_e7});return d;}},{name:"testReadAPI_containsValue_rss",timeout:20000,runTest:function(t){var _ea=_3.data.tests.stores.OpenSearchStore.getRSSStore();var d=new doh.Deferred();function _eb(_ec,_ed){t.assertEqual(20,_ec.length);var _ee=_ec[19];t.assertTrue(_ea.containsValue(_ee,"content","Bill Higgins of IBM has written a very well thought out article of why web applications should look and act like web applications, and not the desktop variety.  Well worth a read - http://billhiggins.us/weblog/2007/05/17/the-uncanny-valley-of-user-interface-design\n        (...)"));t.assertTrue(!_ea.containsValue(_ee,"content","bob"));d.callback(true);};function _ef(_f0,_f1){d.errback(_f0);};_ea.fetch({onComplete:_eb,onError:_ef});return d;}},{name:"testReadAPI_containsValue_html",timeout:20000,runTest:function(t){var _f2=_3.data.tests.stores.OpenSearchStore.getHTMLStore();var d=new doh.Deferred();function _f3(_f4,_f5){t.assertEqual(20,_f4.length);var _f6=_f4[19];var val=_f2.getValue(_f6,"content").replace(/20/g,"19");_f6=_f4[18];t.assertTrue(_f2.containsValue(_f6,"content",val));t.assertTrue(!_f2.containsValue(_f6,"content","bob"));d.callback(true);};function _f7(_f8,_f9){d.errback(_f8);};_f2.fetch({onComplete:_f3,onError:_f7});return d;}},{name:"testReadAPI_sortDescending_atom",timeout:20000,runTest:function(t){var _fa=_3.data.tests.stores.OpenSearchStore.getAtomStore();var _fb=["http://shaneosullivan.wordpress.com/2007/07/25/why-is-my-web-page-slow-yslow-for-firebug-can-tell-you/","http://shaneosullivan.wordpress.com/2007/08/23/dojo-event-performance-tip/","http://shaneosullivan.wordpress.com/2007/10/18/upgrading-ubuntu-feisty-fawn-704-to-gutsy-gibbon-710/","http://shaneosullivan.wordpress.com/2007/06/19/is-dojo-being-ignored-by-developers/","http://shaneosullivan.wordpress.com/2007/08/22/dojo-09-released/","http://shaneosullivan.wordpress.com/2007/08/17/dojo-theme-browser-shows-off-dijit-widgets/","http://shaneosullivan.wordpress.com/2008/01/22/using-aol-hosted-dojo-with-your-custom-code/","http://shaneosullivan.wordpress.com/2007/10/05/dojo-grid-has-landed/","http://shaneosullivan.wordpress.com/2007/12/31/navigating-in-an-ie-modal-dialog/","http://shaneosullivan.wordpress.com/2007/10/13/introducing-the-new-dojo-image-widgets/","http://shaneosullivan.wordpress.com/2007/09/04/image-gallery-slideshow-and-flickr-data-source-for-dojo-09/","http://shaneosullivan.wordpress.com/2007/09/22/querying-flickr-with-dojo/","http://shaneosullivan.wordpress.com/2007/06/15/dojo-charting-example-to-show-website-statistics-2/","http://shaneosullivan.wordpress.com/2007/10/04/a-tortoisesvn-replacement-for-ubuntu/","http://shaneosullivan.wordpress.com/2007/07/03/flickr-and-dojo-image-gallery/","http://shaneosullivan.wordpress.com/2007/05/22/greasemonkey-script-to-add-digg-like-links-to-posts/","http://shaneosullivan.wordpress.com/2007/09/13/specifying-the-callback-function-with-the-flickr-json-apis/","http://shaneosullivan.wordpress.com/2008/01/07/dojo-demo-engine-update/","http://shaneosullivan.wordpress.com/2007/12/04/a-new-demo-engine-for-dojo/","http://shaneosullivan.wordpress.com/2007/05/22/article-on-the-square-pegs-and-round-holes-of-desktop-and-web-applications/"];var d=new doh.Deferred();function _fc(_fd,_fe){t.assertEqual(20,_fd.length);for(var i=0;i<_fd.length;i++){var id=_fd[i].node.getElementsByTagName("id");t.assertEqual(id.length,1);t.assertEqual(_fb[i],_3.xml.parser.textContent(id[0]));}d.callback(true);};function _ff(_100,_101){d.errback(_100);};var _102=[{attribute:"content",descending:true}];_fa.fetch({sort:_102,onComplete:_fc,onError:_ff});return d;}},{name:"testReadAPI_sortDescending_rss",timeout:20000,runTest:function(t){var _103=_3.data.tests.stores.OpenSearchStore.getRSSStore();var _104=["http://shaneosullivan.wordpress.com/2007/07/25/why-is-my-web-page-slow-yslow-for-firebug-can-tell-you/","http://shaneosullivan.wordpress.com/2007/08/23/dojo-event-performance-tip/","http://shaneosullivan.wordpress.com/2007/10/18/upgrading-ubuntu-feisty-fawn-704-to-gutsy-gibbon-710/","http://shaneosullivan.wordpress.com/2007/06/19/is-dojo-being-ignored-by-developers/","http://shaneosullivan.wordpress.com/2007/10/05/dojo-grid-has-landed/","http://shaneosullivan.wordpress.com/2007/08/22/dojo-09-released/","http://shaneosullivan.wordpress.com/2007/08/17/dojo-theme-browser-shows-off-dijit-widgets/","http://shaneosullivan.wordpress.com/2008/01/22/using-aol-hosted-dojo-with-your-custom-code/","http://shaneosullivan.wordpress.com/2007/12/31/navigating-in-an-ie-modal-dialog/","http://shaneosullivan.wordpress.com/2007/10/13/introducing-the-new-dojo-image-widgets/","http://shaneosullivan.wordpress.com/2007/09/04/image-gallery-slideshow-and-flickr-data-source-for-dojo-09/","http://shaneosullivan.wordpress.com/2007/09/22/querying-flickr-with-dojo/","http://shaneosullivan.wordpress.com/2007/06/15/dojo-charting-example-to-show-website-statistics-2/","http://shaneosullivan.wordpress.com/2007/10/04/a-tortoisesvn-replacement-for-ubuntu/","http://shaneosullivan.wordpress.com/2007/07/03/flickr-and-dojo-image-gallery/","http://shaneosullivan.wordpress.com/2007/05/22/greasemonkey-script-to-add-digg-like-links-to-posts/","http://shaneosullivan.wordpress.com/2007/09/13/specifying-the-callback-function-with-the-flickr-json-apis/","http://shaneosullivan.wordpress.com/2007/05/22/article-on-the-square-pegs-and-round-holes-of-desktop-and-web-applications/","http://shaneosullivan.wordpress.com/2008/01/07/dojo-demo-engine-update/","http://shaneosullivan.wordpress.com/2007/12/04/a-new-demo-engine-for-dojo/"];var d=new doh.Deferred();function _105(_106,_107){t.assertEqual(20,_106.length);for(var i=0;i<_106.length;i++){var link=_106[i].node.getElementsByTagName("link");t.assertEqual(link.length,3);t.assertEqual(_104[i],_3.xml.parser.textContent(link[0]));}d.callback(true);};function _108(_109,_10a){d.errback(_109);};var _10b=[{attribute:"content",descending:true}];_103.fetch({sort:_10b,onComplete:_105,onError:_108});return d;}},{name:"testReadAPI_sortDescending_html",timeout:20000,runTest:function(t){var _10c=_3.data.tests.stores.OpenSearchStore.getHTMLStore();var _10d=["Author of 9","Author of 8","Author of 7","Author of 6","Author of 5","Author of 4","Author of 3","Author of 2","Author of 20","Author of 1","Author of 19","Author of 18","Author of 17","Author of 16","Author of 15","Author of 14","Author of 13","Author of 12","Author of 11","Author of 10"];var d=new doh.Deferred();function _10e(_10f,_110){t.assertEqual(20,_10f.length);for(var i=0;i<_10f.length;i++){var td=_10f[i].node.getElementsByTagName("TD");t.assertEqual(td.length,3);t.assertEqual(_10d[i],_3.xml.parser.textContent(td[2]));}d.callback(true);};function _111(_112,_113){d.errback(_112);};var _114=[{attribute:"content",descending:true}];_10c.fetch({sort:_114,onComplete:_10e,onError:_111});return d;}},{name:"testReadAPI_sortAscending_atom",timeout:20000,runTest:function(t){var _115=_3.data.tests.stores.OpenSearchStore.getAtomStore();var _116=["http://shaneosullivan.wordpress.com/2007/05/22/article-on-the-square-pegs-and-round-holes-of-desktop-and-web-applications/","http://shaneosullivan.wordpress.com/2007/12/04/a-new-demo-engine-for-dojo/","http://shaneosullivan.wordpress.com/2008/01/07/dojo-demo-engine-update/","http://shaneosullivan.wordpress.com/2007/09/13/specifying-the-callback-function-with-the-flickr-json-apis/","http://shaneosullivan.wordpress.com/2007/05/22/greasemonkey-script-to-add-digg-like-links-to-posts/","http://shaneosullivan.wordpress.com/2007/07/03/flickr-and-dojo-image-gallery/","http://shaneosullivan.wordpress.com/2007/10/04/a-tortoisesvn-replacement-for-ubuntu/","http://shaneosullivan.wordpress.com/2007/06/15/dojo-charting-example-to-show-website-statistics-2/","http://shaneosullivan.wordpress.com/2007/09/22/querying-flickr-with-dojo/","http://shaneosullivan.wordpress.com/2007/09/04/image-gallery-slideshow-and-flickr-data-source-for-dojo-09/","http://shaneosullivan.wordpress.com/2007/10/13/introducing-the-new-dojo-image-widgets/","http://shaneosullivan.wordpress.com/2007/12/31/navigating-in-an-ie-modal-dialog/","http://shaneosullivan.wordpress.com/2007/10/05/dojo-grid-has-landed/","http://shaneosullivan.wordpress.com/2008/01/22/using-aol-hosted-dojo-with-your-custom-code/","http://shaneosullivan.wordpress.com/2007/08/17/dojo-theme-browser-shows-off-dijit-widgets/","http://shaneosullivan.wordpress.com/2007/08/22/dojo-09-released/","http://shaneosullivan.wordpress.com/2007/06/19/is-dojo-being-ignored-by-developers/","http://shaneosullivan.wordpress.com/2007/10/18/upgrading-ubuntu-feisty-fawn-704-to-gutsy-gibbon-710/","http://shaneosullivan.wordpress.com/2007/08/23/dojo-event-performance-tip/","http://shaneosullivan.wordpress.com/2007/07/25/why-is-my-web-page-slow-yslow-for-firebug-can-tell-you/"];var d=new doh.Deferred();function _117(_118,_119){t.assertEqual(20,_118.length);for(var i=0;i<_118.length;i++){var id=_118[i].node.getElementsByTagName("id");t.assertEqual(id.length,1);t.assertEqual(_116[i],_3.xml.parser.textContent(id[0]));}d.callback(true);};function _11a(_11b,_11c){d.errback(_11b);};var _11d=[{attribute:"content"}];_115.fetch({sort:_11d,onComplete:_117,onError:_11a});return d;}},{name:"testReadAPI_sortAscending_rss",timeout:20000,runTest:function(t){var _11e=_3.data.tests.stores.OpenSearchStore.getRSSStore();var _11f=["http://shaneosullivan.wordpress.com/2007/12/04/a-new-demo-engine-for-dojo/","http://shaneosullivan.wordpress.com/2008/01/07/dojo-demo-engine-update/","http://shaneosullivan.wordpress.com/2007/05/22/article-on-the-square-pegs-and-round-holes-of-desktop-and-web-applications/","http://shaneosullivan.wordpress.com/2007/09/13/specifying-the-callback-function-with-the-flickr-json-apis/","http://shaneosullivan.wordpress.com/2007/05/22/greasemonkey-script-to-add-digg-like-links-to-posts/","http://shaneosullivan.wordpress.com/2007/07/03/flickr-and-dojo-image-gallery/","http://shaneosullivan.wordpress.com/2007/10/04/a-tortoisesvn-replacement-for-ubuntu/","http://shaneosullivan.wordpress.com/2007/06/15/dojo-charting-example-to-show-website-statistics-2/","http://shaneosullivan.wordpress.com/2007/09/22/querying-flickr-with-dojo/","http://shaneosullivan.wordpress.com/2007/09/04/image-gallery-slideshow-and-flickr-data-source-for-dojo-09/","http://shaneosullivan.wordpress.com/2007/10/13/introducing-the-new-dojo-image-widgets/","http://shaneosullivan.wordpress.com/2007/12/31/navigating-in-an-ie-modal-dialog/","http://shaneosullivan.wordpress.com/2008/01/22/using-aol-hosted-dojo-with-your-custom-code/","http://shaneosullivan.wordpress.com/2007/08/17/dojo-theme-browser-shows-off-dijit-widgets/","http://shaneosullivan.wordpress.com/2007/08/22/dojo-09-released/","http://shaneosullivan.wordpress.com/2007/10/05/dojo-grid-has-landed/","http://shaneosullivan.wordpress.com/2007/06/19/is-dojo-being-ignored-by-developers/","http://shaneosullivan.wordpress.com/2007/10/18/upgrading-ubuntu-feisty-fawn-704-to-gutsy-gibbon-710/","http://shaneosullivan.wordpress.com/2007/08/23/dojo-event-performance-tip/","http://shaneosullivan.wordpress.com/2007/07/25/why-is-my-web-page-slow-yslow-for-firebug-can-tell-you/"];var d=new doh.Deferred();function _120(_121,_122){t.assertEqual(20,_121.length);for(var i=0;i<_121.length;i++){var link=_121[i].node.getElementsByTagName("link");t.assertEqual(link.length,3);t.assertEqual(_11f[i],_3.xml.parser.textContent(link[0]));}d.callback(true);};function _123(_124,_125){d.errback(_124);};var _126=[{attribute:"content"}];_11e.fetch({sort:_126,onComplete:_120,onError:_123});return d;}},{name:"testReadAPI_sortAscending_html",timeout:20000,runTest:function(t){var _127=_3.data.tests.stores.OpenSearchStore.getHTMLStore();var _128=["Author of 10","Author of 11","Author of 12","Author of 13","Author of 14","Author of 15","Author of 16","Author of 17","Author of 18","Author of 19","Author of 1","Author of 20","Author of 2","Author of 3","Author of 4","Author of 5","Author of 6","Author of 7","Author of 8","Author of 9"];var d=new doh.Deferred();function _129(_12a,_12b){t.assertEqual(20,_12a.length);for(var i=0;i<_12a.length;i++){var td=_12a[i].node.getElementsByTagName("TD");t.assertEqual(td.length,3);t.assertEqual(_128[i],_3.xml.parser.textContent(td[2]));}d.callback(true);};function _12c(_12d,_12e){d.errback(_12d);};var _12f=[{attribute:"content"}];_127.fetch({sort:_12f,onComplete:_129,onError:_12c});return d;}},{name:"testReadAPI_isItemLoaded_atom",timeout:20000,runTest:function(t){var _130=_3.data.tests.stores.OpenSearchStore.getAtomStore();var d=new doh.Deferred();function _131(_132,_133){t.assertEqual(20,_132.length);var item=_132[0];t.assertTrue(_130.isItemLoaded(item));d.callback(true);};function _134(_135,_136){d.errback(_135);};_130.fetch({onComplete:_131,onError:_134});return d;}},{name:"testReadAPI_isItemLoaded_rss",timeout:20000,runTest:function(t){var _137=_3.data.tests.stores.OpenSearchStore.getRSSStore();var d=new doh.Deferred();function _138(_139,_13a){t.assertEqual(20,_139.length);var item=_139[0];t.assertTrue(_137.isItemLoaded(item));d.callback(true);};function _13b(_13c,_13d){d.errback(_13c);};_137.fetch({onComplete:_138,onError:_13b});return d;}},{name:"testReadAPI_isItemLoaded_html",timeout:20000,runTest:function(t){var _13e=_3.data.tests.stores.OpenSearchStore.getHTMLStore();var d=new doh.Deferred();function _13f(_140,_141){t.assertEqual(20,_140.length);var item=_140[0];t.assertTrue(_13e.isItemLoaded(item));d.callback(true);};function _142(_143,_144){d.errback(_143);};_13e.fetch({onComplete:_13f,onError:_142});return d;}},{name:"testReadAPI_getFeatures",timeout:20000,runTest:function(t){var _145=_3.data.tests.stores.OpenSearchStore.getAtomStore();var _146=_145.getFeatures();t.assertTrue(_1.isObject(_146));t.assertTrue(_146["dojo.data.api.Read"]);t.assertFalse(_146["dojo.data.api.Identity"]);t.assertFalse(_146["dojo.data.api.Write"]);t.assertFalse(_146["dojo.data.api.Notification"]);}},{name:"testReadAPI_getAttributes_atom",timeout:20000,runTest:function(t){var _147=_3.data.tests.stores.OpenSearchStore.getAtomStore();var d=new doh.Deferred();function _148(_149,_14a){t.assertEqual(20,_149.length);var item=_149[0];var _14b=_147.getAttributes(item);t.assertTrue(_1.isArray(_14b));t.assertEqual(1,_14b.length);t.assertTrue(_14b[0]==="content");d.callback(true);};function _14c(_14d,_14e){d.errback(_14d);};_147.fetch({onComplete:_148,onError:_14c});return d;}},{name:"testReadAPI_getAttributes_rss",timeout:20000,runTest:function(t){var _14f=_3.data.tests.stores.OpenSearchStore.getRSSStore();var d=new doh.Deferred();function _150(_151,_152){t.assertEqual(20,_151.length);var item=_151[0];var _153=_14f.getAttributes(item);t.assertTrue(_1.isArray(_153));t.assertEqual(1,_153.length);t.assertTrue(_153[0]==="content");d.callback(true);};function _154(_155,_156){d.errback(_155);};_14f.fetch({onComplete:_150,onError:_154});return d;}},{name:"testReadAPI_getAttributes_html",timeout:20000,runTest:function(t){var _157=_3.data.tests.stores.OpenSearchStore.getHTMLStore();var d=new doh.Deferred();function _158(_159,_15a){t.assertEqual(20,_159.length);var item=_159[0];var _15b=_157.getAttributes(item);t.assertTrue(_1.isArray(_15b));t.assertEqual(1,_15b.length);t.assertTrue(_15b[0]==="content");d.callback(true);};function _15c(_15d,_15e){d.errback(_15d);};_157.fetch({onComplete:_158,onError:_15c});return d;}},{name:"testReadAPI_functionConformance",timeout:20000,runTest:function(t){var _15f=_3.data.tests.stores.OpenSearchStore.getAtomStore();var _160=new _1.data.api.Read();var _161=true;for(var i in _160){var _162=_160[i];if(typeof _162==="function"){var _163=_15f[i];if(!(typeof _163==="function")){_161=false;break;}}}t.assertTrue(_161);}}]);});require(["dojox/data/tests/stores/OpenSearchStore"]);