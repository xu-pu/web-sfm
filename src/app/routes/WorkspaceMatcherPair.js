'use strict';

module.exports =  Ember.Route.extend({

    queryParams: {

        from: {
            refreshModel: true
        },

        to: {
            refreshModel: true
        }

    },

    model: function(params){
        var match = this.modelFor('workspace.matcher').getMatches(params.from, params.to);
        return match || Promise.reject();
    },

    serialize: function(model){
        return { from: model.get('from.id'), to: model.get('to.id') };
    }

});