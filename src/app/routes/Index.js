'use strict';

module.exports = Ember.Route.extend({

    model: function(){
        return this.controllerFor('context').promiseProject();
    },

    afterModel: function(){
        this.transitionTo('workspace');
    },

    actions: {
        error: function(){
            this.transitionTo('welcome');
        }
    }

});