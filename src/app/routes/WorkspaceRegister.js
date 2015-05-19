'use strict';

var settings = require('../settings.js'),
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
                sparse: {
                    points: pointsArray,
                    colors: colorsArray,
                    size: size
                },
                cameras: results[2]
            };
        });
    }

});