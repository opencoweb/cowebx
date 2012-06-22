//
// Adds create, update, delete cooperative features to a 
// dojo.data.ItemFileWriteStore object. Sends any local CRUD changes to remote
// instances and vice-versa while maintaining data store consistency. 
//
// Copyright (c) The Dojo Foundation 2011. All Rights Reserved.
// Copyright (c) IBM Corporation 2008, 2011. All Rights Reserved.
//
/*global define dojo*/
define([
    "dojo",
    "coweb/main",
    "dojo/data/ItemFileWriteStore"
], function(dojo, coweb, ItemFileWriteStore) {

    // Try to create a unique ID across all clients.
    function uniqueId() {
        return String(Math.random()).substr(2) + String((new Date()).getTime());
    }

    // reference to a regular dojo.data.ItemFileWriteStore instance
    var CoopItemFileWriteStore = function(args) {
        this.dataStore = args.dataStore;
        this.id = args.id;
        this.grid = args.grid;
        this.colist = args.colist;
        if(!this.dataStore || !this.id || !this.grid || !this.colist) {
            throw new Error('missing dataStore or id argument');
        }

        this.subscribers = [this];
        /* As frustrating as this is, I cannot for the life of me figure out how to insert
           rows into a DataGrid at specific positions. Thus, I'll keep track of the list
           data in an array, and update the ItemFileWriteStore *every* time an operation
           occurs. */
        this.bgData = [];
        // stores dojo.connect handles for observers of the data store
        this.dsHandles = {};
        this.removed = {};
        this.connectAll();
        // initialize collab interface using the dojo widget id as the
        // id for the collab instance
        this.collab = coweb.initCollab({id : this.id});
        // listen for datastore 'change' messages sent by remote instances of 
        // this widget; the change messages include item ids to allow coweb to
        // check consistency on a per-item basis, rather than per-grid, so we
        // include the * here to listen to all change messages
        this.collab.subscribeSync('change', this, 'onRemoteChange');
        // listen for requests from remote applications joining the session
        // when they ask for the full state of this widget
        this.collab.subscribeStateRequest(this, 'onGetFullState');
        // listen for responses from remote applications when this application
        // instance joins a session so it can bring itself up to the current 
        // state
        this.collab.subscribeStateResponse(this, 'onSetFullState');
    };
    // Static members.
    // maps data store events to methods on this instance for ease of
    // connecting and disconnecting data store listeners
    CoopItemFileWriteStore.typeToFuncs = {
        update: {ds : 'onSet', coop: 'onLocalUpdate'},
        insert: {ds : 'onNew', coop: 'onLocalInsert'},
        'delete': {ds : 'onDelete', coop: 'onLocalDelete'}
    };

    var proto = CoopItemFileWriteStore.prototype;

    proto.disconnectAll = function() {
        this._dsConnect(false, "insert");
        this._dsConnect(false, "update");
        this._dsConnect(false, "delete");
    }
    
    proto.connectAll = function() {
        this._dsConnect(true, "insert");
        this._dsConnect(true, "update");
        this._dsConnect(true, "delete");
    }

    /**
     * Connects or disconnects the observer method on this instance to one
     * of the data store events.
     *
     * @param connect True to connect, false to disconnect
     * @param type 'insert', 'update', or 'delete'
     */
    proto._dsConnect = function(connect, type) {
        if(connect) {
            // get info about the data store and local functions
            var funcs = CoopItemFileWriteStore.typeToFuncs[type];
            // do the connect
            var h = dojo.connect(this.dataStore, funcs.ds, this, funcs.coop);
            // store the connect handle so we can disconnect later
            this.dsHandles[type] = h;
        } else {
            // disconnect using the previously stored handle
            dojo.disconnect(this.dsHandles[type]);
            // delete the handle
            this.dsHandles[type] = null;
        }
    };

    /**
     * Serializes a flat item in the data store to a regular JS object with 
     * name/value properties.
     *
     * @param item Item from the data store
     * @return row Object
     */
    proto._itemToRow = function(item) {
        var row = {};
        dojo.forEach(this.dataStore.getAttributes(item), function(attr) {
            row[attr] = this.dataStore.getValue(item, attr);
        }, this);
        return row;
    };
    
    /**
     * Called when a remote instance of this widget is joining a session and
     * wants to get up to speed. This instance sends the joining one a 
     * serialized array of all the items in the data store.
     *
     * @param params Object with properties for the ready event (see doc)
     */
    proto.onGetFullState = function(token) {
        this.collab.sendStateResponse(this.bgData, token);
    };
    
    /**
     * Called when this instance of the widget is joining a session and wants
     * to get up to speed. A remote instance provides this widget with an
     * array of all the items in the data store.
     *
     * @param rows Array of row objects to be inserted as items
     */
    proto.onSetFullState = function(bgData) {
        this.bgData = bgData;
        this.buildList();
    };

    proto.buildList = function() {
        this.disconnectAll();
        var emptyData = {data:{identifier:"id", label:"name", items:[]}};
        var store = new ItemFileWriteStore(emptyData);
        dojo.forEach(this.bgData, function(at) {
            store.newItem(at);
        });

        // Replace data store and reconnect listeners.
        dojo.forEach(this.subscribers, function(at) {
            at.dataStore = store;
        });
        this.grid.setStore(store);
        this.connectAll();
    };
    
    /**
     * Called when an attribute of an existing item in the local data store 
     * changes value. Sends the item data and the name of the attribute that
     * changed to remote data stores.
     *
     * @param item Item object that changed
     * @param attr String attribute that changed
     * @param oldValue Previous value of the attr
     * @param newValue New value of the attr
     */
    proto.onLocalUpdate = function(item, attr, oldValue, newValue) {
        // get all attribute values
        var row = this._itemToRow(item);

        // store whole row in case remote needs to reconstruct after delete
        // but indicate which attribute changed for the common update case
        var value = {};
        value.row = row;
        value.attr = attr;

	    var id = this.dataStore.getIdentity(item);
        var pos = this.grid.getItemIndex(item);
        this.bgData[pos][attr] = row[attr];
	    this.collab.sendSync("change", value, 'update', pos);
    };
    
    /**
     * Called when a new item appears in the local data store. Sends the new
     * item data to remote data stores.
     *
     * @param item New item object
     * @param parentInfo Unused
     */
    proto.onLocalInsert = function(item, parentInfo) {
        // get all attribute values
        var row = this._itemToRow(item);
        var value = {row:row};

	    var id = this.dataStore.getIdentity(item);
        var pos = this.grid.getItemIndex(item);
        this.bgData.splice(pos, 0, row);
	    this.collab.sendSync("change", value, 'insert', pos);
    };
    
    /**
     * Called when a item disappears from the local data store. Sends just the
     * id of the removed item to remote data stores.
     *
     * @param item Deleted item
     */
    proto.onLocalDelete = function(item) {
        // get all attribute values
	    // name includes row id for conflict resolution
	    var id = this.dataStore.getIdentity(item);
        var pos = this.removed[id];
        delete this.removed[id];
        this.bgData.splice(pos, 1);
	    this.collab.sendSync("change", null, 'delete', pos);
    };
    
    /**
     * Called when a remote data store changes in some manner. Dispatches to
     * local methods for insert, update, delete handling.
     *
     * @param args Cooperative web event
     */
    proto.onRemoteChange = function(args) {
        var value = args.value;
        var r = value?value['name']:null;
        console.log("Remote %s [%d]=%s",args.type,args.position, r);
        // retrieve the row id from the name
        if(args.type === 'insert') {
            this.onRemoteInsert(value, args.position);
        } else if(args.type === 'update') {
            this.onRemoteUpdate(value, args.position);
        } else if(args.type === 'delete') {
            this.onRemoteDelete(args.position);
        }
    };
    
    /**
     * Called when a new item appears in a remote data store. Creates an item
     * with the same id and value in the local data store.
     *
     * @param id Identity assigned to the item in the creating data store
     * @param value Item data sent by remote data store
     */
    proto.onRemoteInsert = function(value, position) {
        // This is the unfortunate case we must rebuild the data grid (since I can't insert at arbitrary position...).
        this.bgData.splice(position, 0, value.row);
        this.buildList();
    };
    
    /**
     * Called when an item attribute changes value in a remote data store.
     * Updates the attribute value of the item with the same id in the local
     * data store.
     *
     * @param id Identity of the item that changed
     * @param value Item data sent by remote data store
     */
    proto.onRemoteUpdate = function(value, position) {
        // fetch the item by its id
        var item = this.grid.getItem(position);
        this._dsConnect(false, 'update');
        var attr = value.attr;
        var newVal = value.row[attr];
        this.bgData[position][attr] = newVal;
        this.dataStore.setValue(item, attr, newVal);
        // resume listening to local updates
        this._dsConnect(true, 'update');
    };
    
    /**
     * Called when an item disappears from a remote data store. Removes the
     * item with the same id from the local data store.
     *
     * @param id Identity of the item that was deleted
     */
    proto.onRemoteDelete = function(position) {
        var item = this.grid.getItem(position);
        // stop listening to local deletes
        this._dsConnect(false, 'delete');
        this.bgData.splice(position, 1);
        this.dataStore.deleteItem(item);
        // resume listening to local deletes
        this._dsConnect(true, 'delete');
    };

    proto.removedRow = function(item) {
        this.removed[this.dataStore.getIdentity(item)] = this.grid.getItemIndex(item);
    }

    /* Anytime the dataStore of this object changes to a new value, all subscribers
       will have their dataStore object set also. */
    proto.subscribeDataStoreChanges(obj) {
        this.subscribers.push(obj);
    }

    return CoopItemFileWriteStore;
});
