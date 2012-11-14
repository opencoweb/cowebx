
/*
	Cooperative list app.

	Copyright (c) The Dojo Foundation 2011. All Rights Reserved.
	Copyright (c) IBM Corporation 2008, 2011. All Rights Reserved.

	Requires OCW >= 0.8.2 and dojo >= 1.7.0 (support for AMD).

*/

define([
	"dojo",
	"dijit/registry",
	"coweb/main",
	"colist/CoopGrid",
	"dojox/grid/DataGrid",
	"dojo/data/ItemFileWriteStore",
	"cowebx/dojo/BusyDialog/BusyDialog",
	"dojo/_base/array",
	"dijit/form/Button",
	"dijit/layout/BorderContainer",
	"dijit/layout/ContentPane"
], function(dojo, dijit, coweb, CoopGrid, DataGrid, ItemFileWriteStore,
	BusyDialog, arrays) {

	function getURLParams() {
		var urlParams = {};
		var searchText = window.location.search.substring(1);
		var searchSegs = searchText.split("&");
		for(var i=0, l=searchSegs.length; i<l; i++) {
			var tmp = searchSegs[i].split("=");
			urlParams[decodeURIComponent(tmp[0])] = decodeURIComponent(tmp[1]);
		}
		return urlParams;
	};

	var CoListApp = function() {
	};

	var proto = CoListApp.prototype;
	proto.init = function() {
		// Parse declarative widgets.
		dojo.parser.parse();

		this.grid = dijit.byId("grid");
		this.grid.canSort = function(){return false;} // Disable column sorting.
		this.dataStore = null; // This will be set each time by buildList.
		this.dsHandles = {}; // See _dsConnect.

		this.initCollab();

		/* This is what we store internally - the list state is an array of
		 * objects. Each object has three properties: id, name, and amount. */
		this.bgData = [];
		this.buildList()

		/* Map from DataGrid row ID to its position in the grid. See
		 * onRemoveRow and onLocalDelete. */
		this.removed = {};

		/* Instantiate our cooperative grid extension, giving it a reference to
		 * the dojox.grid.DataGrid widget. */
		args = {grid : this.grid, id : "colist_grid"};
		var coopGrid = new CoopGrid(args);

		// Listen to and enable add/delete buttons.
		var addButton = dijit.byId("addRowButton");
		var removeButton = dijit.byId("removeRowButton");
		dojo.connect(addButton, "onClick", this, "onAddRow");
		dojo.connect(removeButton, "onClick", this, "onRemoveRow");

		// Get a session instance.
		var sess = coweb.initSession();
		sess.onStatusChange = function(status) {
			console.log(status);
		}
		BusyDialog.createBusy(sess); // This is a widget in cowebx-widgets-dojo. Make sure to have the dependency in the pom.xml.
		var urlParams = getURLParams();
		var updaterType = urlParams["updaterType"] === undefined  ? "default" : urlParams["updaterType"];
		sess.prepare({updaterType: updaterType});

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
		arrays.forEach(this.dataStore.getAttributes(item), function(attr) {
			row[attr] = this.dataStore.getValue(item, attr);
		}, this);
		return row;
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
		this.collab.sendSync("change", value, "insert", pos);
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
		this.collab.sendSync("change", value, "update", pos);
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
		// Update this.removed data structure in case any positions need to be re-aligned.
		for (var k in this.removed) {
			if (this.removed[k] > pos)
				--this.removed[k];
		}
		this.collab.sendSync("change", null, "delete", pos);
	};

	/**
	 * Called when a new item appears in a remote data store. Creates an item
	 * with the same id and value in the local data store.
	 *
	 * @param value Item data sent by remote data store
	 * @param position Where to insert the new item.
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
	 * @param value Item data sent by remote data store
	 * @param position Which item to update.
	 */
	proto.onRemoteUpdate = function(value, position) {
		var item = this.grid.getItem(position);
		this._dsConnect(false, "update");

		var attr = value.attr;
		var newVal = value.row[attr];
		this.bgData[position][attr] = newVal;
		this.dataStore.setValue(item, attr, newVal);

		this._dsConnect(true, "update");
	};

	/**
	 * Called when an item disappears from a remote data store. Removes the
	 * item with the same id from the local data store.
	 *
	 * @param position Which item to delete.
	 */
	proto.onRemoteDelete = function(position) {
		var item = this.grid.getItem(position);
		this._dsConnect(false, "delete");

		this.bgData.splice(position, 1);
		this.dataStore.deleteItem(item);

		this._dsConnect(true, "delete");
	};

	/**
	 * Called when a remote data store changes in some manner. Dispatches to
	 * local methods for insert, update, delete handling.
	 *
	 * @param args Cooperative web event
	 */
	proto.onRemoteChange = function(args) {
		var value = args.value;
		if (args.type === "insert") {
			this.onRemoteInsert(value, args.position);
		} else if (args.type === "update") {
			this.onRemoteUpdate(value, args.position);
		} else if (args.type === "delete") {
			this.onRemoteDelete(args.position);
		}
	};

	/**
	 * Called when a remote instance of this widget is joining a session and
	 * wants to get up to speed. This instance sends the joining one a
	 * serialized array of all the items in the data store.
	 *
	 * @param token Object with properties for the ready event (see doc).
	 */
	proto.onGetFullState = function(token) {
		this.collab.sendStateResponse(this.bgData, token);
	};

	/**
	 * Called when this instance of the widget is joining a session and wants
	 * to get up to speed. A remote instance provides this widget with an
	 * array of all the items in the data store.
	 *
	 * @param bgData Array of row objects to be inserted as items.
	 */
	proto.onSetFullState = function(bgData) {
		this.bgData = bgData;
		this.buildList();
	};

	/**
	  * Disconnect all listeners from the data store.
	  */
	proto._disconnectAll = function() {
		this._dsConnect(false, "insert");
		this._dsConnect(false, "update");
		this._dsConnect(false, "delete");
	};

	/**
	  * Connect all listeners to the data store.
	  */
	proto._connectAll = function() {
		this._dsConnect(true, "insert");
		this._dsConnect(true, "update");
		this._dsConnect(true, "delete");
	};

	/**
	  * Static object that maps data store events to methods on this instance for
	  * ease of connecting and disconnecting data store listeners.
	  */
	CoListApp.typeToFuncs = {
		"update": {ds : "onSet", coop: "onLocalUpdate"},
		"insert": {ds : "onNew", coop: "onLocalInsert"},
		"delete": {ds : "onDelete", coop: "onLocalDelete"}
	};

	/**
	 * Connects or disconnects the observer method on this instance to one
	 * of the data store events.
	 *
	 * @param connect True to connect, false to disconnect
	 * @param type "insert", "update", or "delete"
	 */
	proto._dsConnect = function(connect, type) {
		if (connect) {
			// get info about the data store and local functions
			var funcs = CoListApp.typeToFuncs[type];
			// do the connect
			var h = dojo.connect(this.dataStore, funcs.ds, this, funcs.coop);
			// store the connect handle so we can disconnect later
			this.dsHandles[type] = h;
		} else {
			if (!this.dsHandles[type])
				return;
			// disconnect using the previously stored handle
			dojo.disconnect(this.dsHandles[type]);
			// delete the handle
			this.dsHandles[type] = null;
		}
	};

	/**
	  * Creates our application's lone collaborative element: the shopping list.
	  * Also, connect callbacks for collab events.
	  *
	  * If our application had other collaborative elements (a text editor,
	  * chat box, etc) we would initialize other collab objects, for example
	  * with coweb.initCollab({id: "texteditor"}).
	  */
	proto.initCollab = function() {
		// Create a collab object for our shopping list.
		this.collab = coweb.initCollab({id : "shoppinglist"});
		/* Listen to remove sync events with a topic of `change`. Our shopping
		 * list will only send updates through this one topic so that the OT
		 * engine can detect list operation conflicts. */
		this.collab.subscribeSync("change", this, "onRemoteChange");

		/* Listen for requests from remote applications joining the session when
		 * they ask for the full state of this widget. */
		this.collab.subscribeStateRequest(this, "onGetFullState");

		/* Listen for responses from remote applications when this application
		 * instance joins a session so it can bring itself up to the current
		 * state. */
		this.collab.subscribeStateResponse(this, "onSetFullState");
	};

	/**
	 * Adds a new row with default values to the local grid. Note that we don't
	 * send the event to remove clients yet - see ItemFileWriteStore.onNew and
	 * the app.onLocalInsert callback.
	 */
	proto.onAddRow = function() {
		// make pseudo-unique ids
		var date = new Date();
		var id = String(Math.random()).substr(2) + String(date.getTime());
		this.dataStore.newItem({
			id: id,
			name: "New item",
			amount: 0
		});
	};

	/**
	 * Removes all selected rows from the grid. Note that we don't send the
	 * event to remove clients yet - see ItemFileWriteStore.onDelete and the
	 * app.onLocalDelete callback.
	 */
	proto.onRemoveRow = function() {
		var selected = this.grid.selection.getSelected();
		// Remember the positions of the removed elements.
		arrays.forEach(selected, function(item) {
			this.removed[this.dataStore.getIdentity(item)] = this.grid.getItemIndex(item);
		}, this);
		this.grid.removeSelectedRows();
	};

	/**
	  * Uses this.bgData to re-build the DataGrid.
	  */
	proto.buildList = function() {
		this._disconnectAll();
		var emptyData = {data:{identifier:"id", label:"name", items:[]}};
		var store = new ItemFileWriteStore(emptyData);
		arrays.forEach(this.bgData, function(at) {
			store.newItem(at);
		});

		this.dataStore = store;
		this.grid.setStore(store);
		this._connectAll();
	};

	var app = new CoListApp();
	dojo.ready(function() {
		app.init();
	});

});

