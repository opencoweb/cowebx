//
// Cooperative list app.
//
// Copyright (c) The Dojo Foundation 2011. All Rights Reserved.
// Copyright (c) IBM Corporation 2008, 2011. All Rights Reserved.
//

define([
    'dojo',
    'dijit/registry',
    'coweb/main',
    'CoopGrid',
    'CoopItemFileWriteStore',
    'dojox/grid/DataGrid',
    'dojo/data/ItemFileWriteStore',
    'dijit/form/Button',
    'dijit/layout/BorderContainer',
    'dijit/layout/ContentPane'
], function(dojo, dijit, coweb, CoopGrid, CoopItemFileWriteStore, DataGrid, ItemFileWriteStore) {

    var app = {
        init: function(){
            // parse declarative widgets
            dojo.parser.parse();

            // configure the grid datastore, starting it empty
            var emptyData = {identifier : 'id', label : 'name', items: []};
            this.dataStore = new ItemFileWriteStore({data : emptyData});
            this.grid = dijit.byId('grid');
            this.grid.setStore(this.dataStore);

            // instantiate our cooperative datastore extension, giving it a 
            // reference to the dojo.data.ItemFileWriteStore object
            var args = {dataStore : this.dataStore, id : 'colist_store'};
            var coopDataStore = new CoopItemFileWriteStore(args);

            // instantiate our cooperative grid extension, giving it a reference
            // to the dojox.grid.DataGrid widget
            args = {grid : this.grid, id : 'colist_grid'};
            var coopGrid = new CoopGrid(args);
            
            // listen to and enable add/delete buttons
            var addButton = dijit.byId('addRowButton');
            var removeButton = dijit.byId('removeRowButton');
            dojo.connect(addButton, 'onClick', this, 'onAddRow');
            dojo.connect(removeButton, 'onClick', this, 'onRemoveRow');

            // get a session instance
            var sess = coweb.initSession();

            var urlParams = this.getURLParams(); 
            var updaterType = urlParams['updaterType'] === undefined  ? 'default' : urlParams['updaterType'];
            
            // do the prep
            sess.prepare({updaterType: updaterType});
        },
        
        /**
         * Adds a new row with default values to the local grid.
         */
        onAddRow: function() {
            // make pseudo-unique ids
            var date = new Date();
            var id = String(Math.random()).substr(2) + String(date.getTime()); 
            this.dataStore.newItem({
                id: id,
                name: 'New item',
                amount: 0
            });
        },

        /**
         * Removes all selected rows from the grid.
         */
        onRemoveRow: function() {
            this.grid.removeSelectedRows();
        },
        
        getURLParams: function() {
            var urlParams = {};
            var searchText = window.location.search.substring(1);
            var searchSegs = searchText.split('&');
            for(var i=0, l=searchSegs.length; i<l; i++) {
                var tmp = searchSegs[i].split('=');
                urlParams[decodeURIComponent(tmp[0])] = decodeURIComponent(tmp[1]);
            }
            return urlParams;
        }
    };

    // have to wrap class decl in ready when using dojo xd loader
    dojo.ready(function() {
        app.init();
    });
});