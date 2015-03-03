'use strict';

var ndarray = require('ndarray');

var settings = require('../settings.js'),
    STORES = settings.STORES,
    RESOURCES = settings.RESOURCE;

module.exports = Ember.Route.extend({

    model: function(){
        var resources = this.controllerFor('projectResource');
        return Promise.all([
            resources.promiseResource(RESOURCES.SPARSE_POINTS),
            resources.promiseResource(RESOURCES.SPARSE_COLORS),
            resources.promiseResource(RESOURCES.CAMERAS)
        ]).then(function(results){
            var pointsArray = new Float32Array(results[0]),
                colorsArray = new Uint8Array(results[1]),
                size = pointsArray.length/3;
            return {
                points: ndarray(pointsArray, [size, 3]),
                colors: ndarray(colorsArray, [size, 3]),
                size: size,
                cameras: results[2]
            };
        });
    },

    actions: {
        error: function(){
            this.transitionTo('workspace');
        }
    }

});