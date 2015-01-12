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

        var match = this.controllerFor('matches')
            .get('model')
            .find(function(match){
                return match.from === params.from && match.to === params.to;
            }, this);

        return match || Promise.reject();

    },

    serialize: function(model){
        return { from: model.get('from'), to: model.get('to') };
    }

});