'use strict';

module.exports = Ember.Route.extend({

    model: function(params){
        return this.modelFor('workspace.extractor').findBy('id', parseInt(params.id));
    },

    serialize: function(model){
        return { id: model.get('id') };
    }

});