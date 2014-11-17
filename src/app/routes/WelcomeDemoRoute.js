'use strict';

module.exports = Ember.Route.extend({

    model: function(params){
        var demo = this.controllerFor('sfmStore').get('demos').findBy('name', params.name);
        if (demo) {
            return demo;
        }
        else {
            return Promise.reject();
        }
    },

    serialize: function(model){
        return { name: model.get('name') };
    },

    actions: {

        error: function(){
            this.transitionToRoute('welcome');
        },

        didTransition: function(){
            this.controllerFor('welcome').set('isDetailClosed', false);
        }

    }

});
