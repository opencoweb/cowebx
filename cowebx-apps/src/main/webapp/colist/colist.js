//
// Cooperative list app.
//
// Copyright (c) The Dojo Foundation 2011. All Rights Reserved.
// Copyright (c) IBM Corporation 2008, 2011. All Rights Reserved.
//
/*global require dojo dijit*/

// configure coweb and dojo libs before load
var cowebConfig = {
    adminUrl : '/cowebx_apps/admin'
};
var djConfig = {
    modulePaths: {
        'cowebx' : 'dojo',
        'colist' : '../colist'
    },
    baseUrl : '../cowebx-lib/'
};

// do the async load
require({
    paths : {
        coweb : '../coweb-lib/coweb',
        org : '../coweb-lib/org'
    }
}, [
    'coweb/main',
    'CoopGrid',
    'CoopItemFileWriteStore',
    'http://ajax.googleapis.com/ajax/libs/dojo/1.5/dojo/dojo.xd.js'
], function(coweb, CoopGrid, CoopItemFileWriteStore) {
    dojo.require('cowebx.BusyDialog');
    dojo.require('dojox.grid.DataGrid');
    dojo.require('dojo.data.ItemFileWriteStore');
    dojo.require('dijit.form.Button');
    dojo.require('dijit.layout.BorderContainer');
    dojo.require('dijit.layout.ContentPane');

    // have to wrap class decl in ready when using dojo xd loader
    dojo.ready(function() {
        // parse declarative widgets
        dojo.parser.parse();

        // configure the grid datastore, starting it empty
        var emptyData = {identifier : 'id', label : 'name', items: []};
        var dataStore = new dojo.data.ItemFileWriteStore({data : emptyData});
        var grid = dijit.byId('grid');
        grid.setStore(dataStore);
    
        // instantiate our cooperative datastore extension, giving it a 
        // reference to the dojo.data.ItemFileWriteStore object
        var args = {dataStore : dataStore, id : 'colist_store'};
        var coopDataStore = new CoopItemFileWriteStore(args);
    
        // instantiate our cooperative grid extension, giving it a reference
        // to the dojox.grid.DataGrid widget
        args = {grid : grid, id : 'colist_grid'};
        var coopGrid = new CoopGrid(args);
        
        /**
         * Adds a new row with default values to the local grid.
         */
        var onAddRow = function() {
            // make pseudo-unique ids
            var date = new Date();
            var id = String(Math.random()).substr(2) + String(date.getTime()); 
            dataStore.newItem({
                id: id,
                name: 'New item',
                amount: 0
            });
        };

        /**
         * Removes all selected rows from the grid.
         */
        var onRemoveRow = function() {
            grid.removeSelectedRows();
        };

        // listen to and enable add/delete buttons
        var addButton = dijit.byId('addRowButton');
        var removeButton = dijit.byId('removeRowButton');
        dojo.connect(addButton, 'onClick', onAddRow);
        dojo.connect(removeButton, 'onClick', onRemoveRow);
        
        // get a session instance
        var sess = coweb.initSession();
        // use a dojo busy dialog to show progress joining/updating
        cowebx.createBusy(sess);
        // do the prep
        var prep = {collab: true};
        sess.prepareConference(prep);
    });
});