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

    model: function(params, transition){
        var match = this.modelFor('workspace.matcher').getMatches(params.from, params.to);
        if (match) {
            return match;
        }
        else {
            transition.abort();
        }
    },

    serialize: function(model){
        return { from: model.get('from.id'), to: model.get('to.id') };
    },

    actions: {

        error: function(error, transition){
            transition.abort();
            //this.transitionToRoute('workspace.matcher');
        }

    }

});