'use strict';

var settings = require('../settings.js'),
    RESOURCES = settings.RESOURCE;

module.exports = Ember.Route.extend({

    /**
     * Requires Images and Matches
     * @returns {Promise}
     */
    model: function() {
        var resource = this.controllerFor('projectResource');
        return Promise.all([
            this.controllerFor('workspace').get('images'),
            resource.promiseResource(RESOURCES.RAW_MATCHES),
            resource.promiseResource(RESOURCES.ROBUST_MATCHES)
        ]).then(function(results){
            return {
                images: results[0],
                raw: results[1],
                robust: results[2]
            };
        });
    }

});