'use strict';

/*global require*/
var L = require('leaflet');
var defined = require('terriajs-cesium/Source/Core/defined');

var CesiumEvent = require('terriajs-cesium/Source/Core/Event');
var Cartographic = require('terriajs-cesium/Source/Core/Cartographic');
var pollToPromise = require('./Core/pollToPromise');

var MapboxVectorCanvasTileLayer = L.TileLayer.Canvas.extend({
    initialize: function(imageryProvider, options) {
        this.imageryProvider = imageryProvider;
        this.tileSize = 256;
        this.errorEvent = new CesiumEvent();

        this.initialized = false;
        this._usable = false;

        this._delayedUpdate = undefined;
        this._zSubtract = 0;
        this._previousCredits = [];

        L.TileLayer.prototype.initialize.call(this, undefined, options);
    },

    drawTile: function (canvas, tilePoint, zoom) {
        var that = this;
        this.imageryProvider._requestImage(tilePoint.x, tilePoint.y, zoom, canvas).then(function (canvas) {
            that.tileDrawn(canvas);
        });


    },

    pickFeatures: function(map, longitudeRadians, latitudeRadians) {
        var ll = new Cartographic(longitudeRadians, latitudeRadians, 0.0);

        var level = map.getZoom();

        var that = this;
        return pollToPromise(function() {
            return that.imageryProvider.ready;
        }).then(function() {
            var tilingScheme = that.imageryProvider.tilingScheme;
            var tileCoordinates = tilingScheme.positionToTileXY(ll, level);
            if (!defined(tileCoordinates)) {
                return undefined;
            }

            return that.imageryProvider.pickFeatures(tileCoordinates.x, tileCoordinates.y, level, longitudeRadians, latitudeRadians);
        });
    }



});

module.exports = MapboxVectorCanvasTileLayer;
