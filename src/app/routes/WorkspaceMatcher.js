'use strict';

module.exports = Ember.Route.extend({

    /**
     * Requires Images and Matches
     * @returns {Promise}
     */
    model: function() {
        var workspace = this.controllerFor('workspace');
        return Promise.all([
            workspace.get('images'),
            workspace.get('matches')
        ]).then(function(results){
            return {
                images: results[0],
                matches: results[1]
            };
        });
    }

});