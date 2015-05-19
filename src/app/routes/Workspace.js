'use strict';

module.exports = Ember.Route.extend({

    model: function(){
        return this.controllerFor('context').promiseProject();
    },

    actions: {

        error: function(error, transition){
            transition.abort();
        }

    }

});