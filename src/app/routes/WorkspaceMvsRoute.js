'use strict';

var STORES = require('../settings.js').STORES;

module.exports = Ember.Route.extend({

    model: function(){
        return this
            .controllerFor('workspace')
            .get('adapter')
            .promiseData(STORES.SINGLETONS, STORES.MVS);
    },

    setupController: function(controller, model){
        controller.set('pointcloud', model);
    }

});