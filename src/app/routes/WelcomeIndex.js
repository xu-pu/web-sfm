'use strict';

module.exports = Ember.Route.extend({

    setupController: function(){
        this.controllerFor('welcome').set('isDetailClosed', true);
    }

});