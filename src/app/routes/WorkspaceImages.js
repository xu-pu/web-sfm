'use strict';

module.exports = Ember.Route.extend({

    needs: ['context'],

    adapter: Ember.computed.alias('context.adapter'),

    model: function() {
        return this.controllerFor('workspace').get('images');
    }

});