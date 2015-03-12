'use strict';

module.exports = Ember.Route.extend({

    model: function(params){
        return this.controllerFor('context').get('demos').findBy('name', params.name) || Promise.reject();
    },

    serialize: function(model){
        return { name: model.get('name') };
    },

    actions: {

        error: function(){
            this.transitionTo('welcome');
        },

        didTransition: function(){
            this.controllerFor('welcome').set('isDetailClosed', false);
        }

    }

});
