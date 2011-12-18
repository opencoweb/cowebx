//
// Cooperative tree app 
//
// Copyright (c) The Dojo Foundation 2011. All Rights Reserved.
// 
//

define(['dojo','dojo/store/Memory','dijit/Tree','./ObjectStoreModel', 'dojo/store/Observable'],
function(dojo, Memory, Tree, Model, Observable) {
	
	//1. Create store
	var myStore = new Memory({
        data: [
            { id: 'world', name:'The earth', type:'planet', population: '6 billion'},
            { id: 'AF', name:'Africa', type:'continent', population:'900 million', area: '30,221,532 sq km',
                    timezone: '-1 UTC to +4 UTC', parent: 'world'},
                { id: 'EG', name:'Egypt', type:'country', parent: 'AF' },
                { id: 'KE', name:'Kenya', type:'country', parent: 'AF' },
                    { id: 'Nairobi', name:'Nairobi', type:'city', parent: 'KE' },
                    { id: 'Mombasa', name:'Mombasa', type:'city', parent: 'KE' },
                { id: 'SD', name:'Sudan', type:'country', parent: 'AF' },
                    { id: 'Khartoum', name:'Khartoum', type:'city', parent: 'SD' },
            { id: 'AS', name:'Asia', type:'continent', parent: 'world' },
                { id: 'CN', name:'China', type:'country', parent: 'AS' },
                { id: 'IN', name:'India', type:'country', parent: 'AS' },
                { id: 'RU', name:'Russia', type:'country', parent: 'AS' },
                { id: 'MN', name:'Mongolia', type:'country', parent: 'AS' },
            { id: 'OC', name:'Oceania', type:'continent', population:'21 million', parent: 'world'},
            { id: 'EU', name:'Europe', type:'continent', parent: 'world' },
                { id: 'DE', name:'Germany', type:'country', parent: 'EU' },
                { id: 'FR', name:'France', type:'country', parent: 'EU' },
                { id: 'ES', name:'Spain', type:'country', parent: 'EU' },
                { id: 'IT', name:'Italy', type:'country', parent: 'EU' },
            { id: 'NA', name:'North America', type:'continent', parent: 'world' },
            { id: 'SA', name:'South America', type:'continent', parent: 'world' }
        ],
        getChildren: function(object){
            return this.query({parent: object.id});
        }
    });
	myStore = new Observable(myStore);
	
	//2. Create model
    var myModel = new Model({
        store: myStore,
        query: {id: 'world'}
    });
	
	//3. Create tree
	var tree = new Tree({
	    model: myModel
	});
	tree.placeAt(document.body);
	
	//4. Create buttons
	var b = crisp.create({innerHTML:'add',domNode:dojo.byId('add')});
	dojo.connect(b,'onclick',this,function(){
		myStore.add({id: 'US', name:'United States', type:'country', parent: 'NA'});
	});
	
});