'use strict';

module.exports = Ember.Route.extend({

    setupController: function(){
        this.controllerFor('context').set('currentProject', null);
    }

});