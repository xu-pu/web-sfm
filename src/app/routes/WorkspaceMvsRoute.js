'use strict';

var ndarray = require('ndarray');

var STORES = require('../settings.js').STORES;

module.exports = Ember.Route.extend({

    model: function(){
        var adapter = this.controllerFor('workspace').get('adapter');
        return Promise.all([
            adapter.promiseData(STORES.SINGLETONS, STORES.MVS_POINTS),
            adapter.promiseData(STORES.SINGLETONS, STORES.MVS_COLORS)
        ]).then(function(results){
            var pointsArray = new Float32Array(results[0]),
                colorsArray = new Uint8Array(results[1]),
                size = pointsArray.length/3;
            return {
                points: ndarray(pointsArray, [size, 3]),
                colors: ndarray(colorsArray, [size, 3]),
                size: size
            };
        });
    }

});