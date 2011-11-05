//
// Google map widget.
//
// Copyright (c) The Dojo Foundation 2011. All Rights Reserved.
// Copyright (c) IBM Corporation 2008, 2011. All Rights Reserved.
//
/*global dojo dijit google dojox*/
// dojo.provide('comap.GMap');
// dojo.require('dijit._Widget');
// dojo.require('dojo.i18n');
// dojo.require('dojox.uuid.generateRandomUuid');
// 
// dojo.declare('comap.GMap', dijit._Widget, {
//     
// 
// 
// });

define([
    'dojox/uuid/generateRandomUuid'
], function() {
    var GMap = function(args) {
        if(!args.app)
		    throw new Error('GMap: missing app argument');
        // application controller
        this.app = args.app;
        // template to use for marker bubbles
        this.markerTemplate = '';
        this.postCreate();
    };
    var proto = GMap.prototype;
    
    proto.postCreate = function() {
        console.log('create');
        // unordered collection of markers
        this._markers = {};
        // reuse a geocoder
        this._geocoder = new google.maps.Geocoder();
        // reuse a single pop
        this._infopop = new google.maps.InfoWindow();
        // user dragging map?
        this._dragging = false;
        
        // initialize a map widget
        var latlng = new google.maps.LatLng(35.904, -78.873);
        var mapOpts = {
          zoom: 10,
          center: latlng,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          streetViewControl: false,
          disableDoubleClickZoom: true
        };
        this._map = new google.maps.Map(dojo.byId('map'), mapOpts);
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
        dojo.connect(window,'resize',this,'resize');
        this.resize();
    };
    
    proto.resize = function(size) {
        dojo.marginBox(dojo.byId('mapContainer'), size);
        // force map to resize
        google.maps.event.trigger(this._map, 'resize');
    };
    
    proto.getZoom = function() {
        return this._map.getZoom();
    };
    
    proto.setZoom = function(level) {
        this._map.setZoom(level);
    };
    
    proto.getCenter = function() {
        return this._map.getCenter();
    };
    
    proto.setCenter = function(latLng) {
        this._map.setCenter(latLng);
    };
    
    proto.getMapType = function() {
        return this._map.getMapTypeId();
    };
    
    proto.setMapType = function(type) {
        this._map.setMapTypeId(type);
    };
    
    proto.getAllMarkers = function() {
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
    };

    proto.setAllMarkers = function(arr) {
        dojo.forEach(arr, function(item) {
            var latLng = this.latLngFromString(item.latLng);
            this.addMarker(item.uuid, item.creator, latLng);
        }, this);
    };
    
    proto.getMarkerById = function(uuid) {
        return this._markers[uuid];
    };
    
    proto.refreshInfoPop = function(marker) {
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
    };
    
    proto.latLngFromString = function(str) {
        var ll = str.split(',');
        var lat = parseFloat(ll[0]);
        var lng = parseFloat(ll[1]);
        if(isNaN(lat) || isNaN(lng)) {
            throw new Error('invalid "lat,lng" string');
        }
        return new google.maps.LatLng(lat, lng);
    };
    
    proto.addMarker = function(uuid, creator, latLng) {
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
    };
    
    proto.moveMarker = function(marker, latLng) {
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
    };
    
    proto.animateMarker = function(marker) {
        clearTimeout(marker._animTok);
        marker.setAnimation(google.maps.Animation.BOUNCE);
        marker._animTok = setTimeout(function() {
            marker.setAnimation(null);
        }, 2000);
    };

    proto.onMarkerAdded = function(marker) {
        // extension point
    };
    
    proto.onMarkerMoved = function(marker) {
        // extension point
    };
    
    proto.onMarkerAnimated = function(marker) {
        // extension point
    };

    proto.onMapCenter = function(event, intermediate) {
        // extension point
    };
    
    proto.onMapZoom = function(event) {
        // extension point
    };
    
    proto.onMapType = function(event) {
        // extension point
    };

    proto._getMarkerHTML = function(marker) {
        if(this.markerTemplate) {
            return dojo.replace(this.markerTemplate, marker);
        } else {
            return marker._formattedAddress;
        }
    };

    proto._onMapDblClick = function(event) {
        // add a new marker
        var uuid = dojox.uuid.generateRandomUuid();
        var marker = this.addMarker(uuid, this.app.username, event.latLng);
        // indicate marker added
        this.onMarkerAdded(marker);
    };

    proto._onGeocodeResult = function(marker, results, status) {
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
    };
    
    proto._onMarkerClick = function(marker, event) {
        this._infopop.setContent(this._getMarkerHTML(marker));
        this._infopop._anchor = marker;
        this._infopop.open(this._map, marker);
    };
    
    proto._onMarkerDblClick = function(marker, event) {
        this.animateMarker(marker);
        this.onMarkerAnimated(marker);
    };

    proto._onMarkerDragEnd = function(marker, event) {
        this.moveMarker(marker, event.latLng);
        this.onMarkerMoved(marker);
    };
    
    proto._onDragStart = function(event) {
        this._dragging = true;
        this.onMapCenter(event, true);
    };
    
    proto._onDragEnd = function(event) {
        this._dragging = false;
        this.onMapCenter(event, false);
    };
    
    proto._onDrag = function(event) {
        this.onMapCenter(event, true);
    };
    
    proto._onZoomChange = function(event) {
        this.onMapZoom(event);
    };
    
    proto._onCenterChange = function(event) {
        this.onMapCenter(event, this._dragging)
    };
    
    proto._onTypeChange = function(event) {
        this.onMapType(event);
    };
    
    return GMap;
});