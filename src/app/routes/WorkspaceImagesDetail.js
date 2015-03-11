'use strict';

module.exports = Ember.Route.extend({

    model: function(params){
        return this.modelFor('workspace.images').findBy('_id', parseInt(params.id));
    },

    serialize: function(model){
        return { id: model.get('_id') };
    }

});