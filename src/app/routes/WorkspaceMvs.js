'use strict';

var settings = require('../settings.js'),
    RESOURCES = settings.RESOURCE;

module.exports = Ember.Route.extend({

    model: function(){
        var resources = this.controllerFor('projectResource');
        return Promise.all([
            resources.promiseResource(RESOURCES.MVS_POINTS),
            resources.promiseResource(RESOURCES.MVS_COLORS)
        ]).then(function(results){
            var pointsArray = new Float32Array(results[0]),
                colorsArray = new Uint8Array(results[1]),
                size = pointsArray.length/3;
            return {
                points: pointsArray,
                colors: colorsArray,
                size: size
            };
        });
    }

});