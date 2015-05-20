'use strict';

var Matches = require('../models/Matches.js'),
    settings = require('../settings.js'),
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
            resource.promiseResource(RESOURCES.MATCHES).catch(function(){ return []; })
        ]).then(function(results){
            return Matches.create({
                images: results[0],
                matches: results[1]
            });
        });
    }

});