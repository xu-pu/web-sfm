'use strict';

var STORES = require('../settings.js').STORES;

module.exports = Ember.Route.extend({

    model: function(){
        return this
            .controllerFor('workspace')
            .get('adapter')
            .promiseData(STORES.SINGLETONS, STORES.BUNDLER);
    },

    actions: {
        error: function(){
            this.transitionTo('workspace');
        }
    }

});