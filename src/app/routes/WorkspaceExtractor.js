'use strict';

module.exports = Ember.Route.extend({

    model: function() {
        return this.controllerFor('workspace').get('images');
    }

});