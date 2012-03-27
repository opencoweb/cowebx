//
// Google map with collab control
//
// Copyright (c) The Dojo Foundation 2011. All Rights Reserved.
//

define([
    'dojo',
	"dojo/_base/declare", // declare
	"dijit/_Widget",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dijit/_Contained",
	"dojo/text!./GMap.html",
	'coweb/main',
    'coweb/ext/attendance',
	'dojox/uuid/generateRandomUuid'
], function(dojo, declare, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin, _Contained, template, coweb, attendance){

	return declare("GMap", [_Widget, _TemplatedMixin, _Contained, _WidgetsInTemplateMixin], {
	    // application controller
        app : null,
        // template to use for marker bubbles
        markerTemplate : '',
		// widget template
		templateString: template,
        
        postMixInProperties: function() {
            // unordered collection of markers
            this._markers = {};
            // reuse a geocoder
            this._geocoder = new google.maps.Geocoder();
            // reuse a single pop
            this._infopop = new google.maps.InfoWindow();
            // user dragging map?
            this._dragging = false;
        },

		startup: function(){
			// initialize a map widget
			this._loadTemplate("../lib/cowebx/dojo/GMap/GMap.css");
            var latlng = new google.maps.LatLng(35.904, -78.873);
            var mapOpts = {
              zoom: 10,
              center: latlng,
              mapTypeId: google.maps.MapTypeId.ROADMAP,
              streetViewControl: false,
              disableDoubleClickZoom: true
            };
            this._map = new google.maps.Map(dojo.byId('gmap'), mapOpts);
            // connect to events
            google.maps.event.addListener(this._map, 'dblclick', 
                dojo.hitch(this, '_onMapDblClick'));
            google.maps.event.addListener(this._map, 'center_changed', 
                dojo.hitch(this, '_onCenterChange'));
            google.maps.event.addListener(this._map, 'dragstart', 
                dojo.hitch(this, '_onDragStart'));
            google.maps.event.addListener(this._map, 'dragend', 
                dojo.hitch(this, '_onDragEnd'));
            google.maps.event.addListener(this._map, 'drag', 
                dojo.hitch(this, '_onDrag'));
            google.maps.event.addListener(this._map, 'zoom_changed', 
                dojo.hitch(this, '_onZoomChange'));
            google.maps.event.addListener(this._map, 'maptypeid_changed', 
                dojo.hitch(this, '_onTypeChange'));

			var hash = dojo.hash();
            if(hash) {
                this.onHashChange(hash);
            }
            // listen to hash changes
            dojo.subscribe('/dojo/hashchange', this, 'onHashChange');

			dojo.connect(dijit.byId('syncButton'), 'onClick', this, 'onMapSyncClick');
            dojo.connect(dijit.byId('syncBox'), 'onChange', this, 'onMapContinuousSyncClick');
            dojo.connect(this, 'onMarkerAdded', this, 'onMapMarkerAdded');
            dojo.connect(this, 'onMarkerMoved', this, 'onMapMarkerMoved');
            dojo.connect(this, 'onMarkerAnimated', this, 'onMapMarkerAnimated');

			this.collab = coweb.initCollab({id : 'GMap'});
            this.collab.subscribeReady(this, 'onCollabReady');
            this.collab.subscribeStateRequest(this, 'onStateRequest');
            this.collab.subscribeStateResponse(this, 'onStateResponse');
            this.collab.subscribeSync('marker.add.*', this, 'onRemoteMapMarkerAdded');
            this.collab.subscribeSync('marker.move.*', this, 'onRemoteMapMarkerMoved');
            this.collab.subscribeSync('marker.anim.*', this, 'onRemoteMapMarkerAnimated');
            this.collab.subscribeSync('map.viewport', this, 'onRemoteMapViewport');
			setTimeout(dojo.hitch(this, 'resize'),1000);
		},

        resize: function(size) {
			dijit.byId('layoutTwo').resize();
            dojo.marginBox(this.domNode, size);
            // force map to resize
            google.maps.event.trigger(this._map, 'resize');
        },

        getZoom: function() {
            return this._map.getZoom();
        },

        setZoom: function(level) {
            this._map.setZoom(level);
        },

        getCenter: function() {
            return this._map.getCenter();
        },

        setCenter: function(latLng) {
            this._map.setCenter(latLng);
        },

        getMapType: function() {
            return this._map.getMapTypeId();
        },

        setMapType: function(type) {
            this._map.setMapTypeId(type);
        },

        getAllMarkers: function() {
            var arr = [];
            for(var uuid in this._markers) {
                var m = this._markers[uuid];
                arr.push({
                    uuid : uuid,
                    latLng : m.getPosition().toUrlValue(),
                    creator : m._creator
                });
            }
            return arr;
        },

        setAllMarkers: function(arr) {
            dojo.forEach(arr, function(item) {
                var latLng = this.latLngFromString(item.latLng);
                this.addMarker(item.uuid, item.creator, latLng);
            }, this);
        },

        getMarkerById: function(uuid) {
            return this._markers[uuid];
        },

        refreshInfoPop: function(marker) {
            var anchor = this._infopop._anchor;
            if(marker) {
                if(marker == anchor) {
                    // refresh given marker if it's the anchor
                    this._infopop.setContent(this._getMarkerHTML(marker));
                }
            } else if(anchor) {
                // refresh the anchor because no marker given
                this._infopop.setContent(this._getMarkerHTML(anchor));
            }
        },

        latLngFromString: function(str) {
            var ll = str.split(',');
            var lat = parseFloat(ll[0]);
            var lng = parseFloat(ll[1]);
            if(isNaN(lat) || isNaN(lng)) {
                throw new Error('invalid "lat,lng" string');
            }
            return new google.maps.LatLng(lat, lng);
        },

        addMarker: function(uuid, creator, latLng) {
            // add a new marker
            var marker = new google.maps.Marker({
                position: latLng, 
                map: this._map,
                draggable : true,
                title: dojo.replace('Added by {0}', [creator]),
                animation: google.maps.Animation.DROP
            });
            // store creator on marker
            marker._creator = creator;
            // store unique id on marker
            marker._uuid = uuid;
            // start formatted address as pending
            marker._formattedAddress = 'Pending geocode ...';
            // listen to marker events
            google.maps.event.addListener(marker, 'click',
                dojo.hitch(this, '_onMarkerClick', marker));
            google.maps.event.addListener(marker, 'dblclick',
                dojo.hitch(this, '_onMarkerDblClick', marker));
            google.maps.event.addListener(marker, 'dragend',
                dojo.hitch(this, '_onMarkerDragEnd', marker));
            // reverse geocode the location
            this._geocoder.geocode({latLng : latLng}, 
                dojo.hitch(this, '_onGeocodeResult', marker));
            // store marker
            this._markers[uuid] = marker;
            return marker;
        },

        moveMarker: function(marker, latLng) {
            // set the new position
            marker.setPosition(latLng);
            // reset computed address
            marker._formattedAddress = 'Pending geocode ...';
            // check if info window needs to go back to pending state
            if(this._infopop._anchor == marker) {
                this._infopop.setContent(this._getMarkerHTML(marker));
            }
            // reverse geocode again
            this._geocoder.geocode({latLng : latLng}, 
                dojo.hitch(this, '_onGeocodeResult', marker));
        },

        animateMarker: function(marker) {
            clearTimeout(marker._animTok);
            marker.setAnimation(google.maps.Animation.BOUNCE);
            marker._animTok = setTimeout(function() {
                marker.setAnimation(null);
            }, 2000);
        },

		onHashChange: function(hash) {
            var latLng;
            try {
                latLng = this.latLngFromString(hash);
            } catch(e) {
                // ignore bad lat/lng hash
                return;
            }
            this.setCenter(latLng);
        },

		onMapSyncClick: function() {
            this.onMapViewport('update');
        },

		onMapViewport: function(type) {
            var args = {
                zoom : this.getZoom(),
                center : this.getCenter().toUrlValue(),
                type : this.getMapType()
            };
            this.collab.sendSync('map.viewport', args, type);
        },

		onMapContinuousSyncClick: function(selected) {
            if(selected) {
                this.contTok = [];
                var self = this;
                this.contTok.push(dojo.connect(this, 'onMapCenter', 
                    function(e, i) { self.onMapViewport(i ? null : 'update'); }));
                this.contTok.push(dojo.connect(this, 'onMapZoom', 
                    function() { self.onMapViewport('update'); }));
                this.contTok.push(dojo.connect(this, 'onMapType', 
                    function() { self.onMapViewport('update'); }));
            } else {
                dojo.forEach(this.contTok, dojo.disconnect);
                this.contTok = null;
            }
        },

		onMapMarkerAdded: function(marker) {
            var info = {
                uuid : marker._uuid,
                latLng : marker.getPosition().toUrlValue()
            };
            // NO conflict resolution on add, new markers are unique
            this.collab.sendSync('marker.add.'+marker._uuid, info, null);
        },

		onMapMarkerMoved: function(marker) {
            // reset zip visits info set by bot
            delete marker._visitCount;
            this.refreshInfoPop(marker);
        
            var info = {
                uuid : marker._uuid,
                latLng : marker.getPosition().toUrlValue()
            };
            // resolve relocation conflicts
            this.collab.sendSync('marker.move.'+marker._uuid, info, 'update');
        },
		
		onMapMarkerAnimated: function(marker) {
            var info = {
                uuid : marker._uuid
            };
            // NO conflict resolution on animate, anyone can do it any number of
            // times without affecting state
            this.collab.sendSync('marker.anim.'+marker._uuid, info, null);
        },

		onCollabReady: function(info) {
            // store username for use by widgets
            this.username = info.username;
        },

		onStateRequest: function(token) {
            var state = {
                markers : this.getAllMarkers(),
                // not necessary to do viewport, but gets user looking somewhere
                // relevant to one other user at least
                viewport : {
                    zoom : this.getZoom(),
                    center : this.getCenter().toUrlValue(),
                    type : this.getMapType()
                }
            };
            this.collab.sendStateResponse(state, token);
        },

		onStateResponse: function(state) {
            this.setAllMarkers(state.markers);
            this.onRemoteMapViewport({value : state.viewport});
        },

		onRemoteMapMarkerAdded: function(args) {
            var latLng = this.latLngFromString(args.value.latLng);
            var creator = attendance.users[args.site].username;
            this.addMarker(args.value.uuid, creator, latLng);
        },

		onRemoteMapMarkerMoved: function(args) {
            // could receive repeat value when resolve conflict which doesn't hurt
            // us; pass it along
            var latLng = this.latLngFromString(args.value.latLng);
            var marker = this.getMarkerById(args.value.uuid);
            this.moveMarker(marker, latLng);
        },

		onRemoteMapMarkerAnimated: function(args) {
            var marker = this.getMarkerById(args.value.uuid);
            this.animateMarker(marker);
        },

		onRemoteMapViewport: function(args) {
            var latLng = this.latLngFromString(args.value.center);
            this.setMapType(args.value.type);
            this.setZoom(args.value.zoom);
            this.setCenter(latLng);
        },

		onMarkerAdded: function(marker) {
            // extension point
        },

        onMarkerMoved: function(marker) {
            // extension point
        },

        onMarkerAnimated: function(marker) {
            // extension point
        },

        onMapCenter: function(event, intermediate) {
            // extension point
        },

        onMapZoom: function(event) {
            // extension point
        },

        onMapType: function(event) {
            // extension point
        },
		
        _getMarkerHTML: function(marker) {
            if(this.markerTemplate) {
                return dojo.replace(this.markerTemplate, marker);
            } else {
                return marker._formattedAddress;
            }
        },

        _onMapDblClick: function(event) {
            // add a new marker
            var uuid = dojox.uuid.generateRandomUuid();
            var marker = this.addMarker(uuid, this.username, event.latLng);
            // indicate marker added
            this.onMarkerAdded(marker);
        },

        _onGeocodeResult: function(marker, results, status) {
            if(status == google.maps.GeocoderStatus.OK && results[0]) {
                marker._formattedAddress = results[0].formatted_address;
            } else {
                var latLng = marker.getPosition();
                marker._formattedAddress = latLng.toUrlValue();
            }
            // update visible info pop if it's showing over the marker
            if(this._infopop._anchor == marker) {
                this._infopop.setContent(this._getMarkerHTML(marker));
            }
        },

        _onMarkerClick: function(marker, event) {
            this._infopop.setContent(this._getMarkerHTML(marker));
            this._infopop._anchor = marker;
            this._infopop.open(this._map, marker);
        },

        _onMarkerDblClick: function(marker, event) {
            this.animateMarker(marker);
            this.onMarkerAnimated(marker);
        },

        _onMarkerDragEnd: function(marker, event) {
            this.moveMarker(marker, event.latLng);
            this.onMarkerMoved(marker);
        },

        _onDragStart: function(event) {
            this._dragging = true;
            this.onMapCenter(event, true);
        },

        _onDragEnd: function(event) {
            this._dragging = false;
            this.onMapCenter(event, false);
        },

        _onDrag: function(event) {
            this.onMapCenter(event, true);
        },

        _onZoomChange: function(event) {
            this.onMapZoom(event);
        },

        _onCenterChange: function(event) {
            this.onMapCenter(event, this._dragging)
        },

        _onTypeChange: function(event) {
            this.onMapType(event);
        },

		_loadTemplate : function(url) {
	        var e = document.createElement("link");
	        e.href = url;
	        e.type = "text/css";
	        e.rel = "stylesheet";
	        e.media = "screen";
	        document.getElementsByTagName("head")[0].appendChild(e);
	    }
	});
});
