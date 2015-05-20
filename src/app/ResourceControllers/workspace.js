"use strict";

var _ = require('underscore');

var Image = require('../models/Image.js'),
    utils = require('../utils.js'),
    settings = require('../settings.js'),
    RESOURCE = settings.RESOURCE;

module.exports = Ember.Controller.extend({

    needs: ['context', 'projectResource', 'scheduler'],

    scheduler: Ember.computed.alias('controllers.scheduler'),

    workers: Ember.computed.alias('scheduler.workers'),

    threadPoolSize: Ember.computed.alias('scheduler.poolSize'),

    resource: Ember.computed.alias('controllers.projectResource'),

    ctx: Ember.computed.alias('controllers.context'),

    project: Ember.computed.alias('ctx.currentProject'),

    adapter: Ember.computed.alias('ctx.adapter'),

    isRunning: false,

    actions: {

        enter: function(route){
            this.transitionToRoute(route);
        },

        back: function(){
            this.transitionToRoute('welcome');
        }

    },

    images: function(){
        return this.get('resource')
            .promiseResource(RESOURCE.IMAGES)
            .then(function(images){
                return images.map(function(image){
                    image._id = image.id;
                    return Image.create(image);
                }).sortBy('id');
            });
    }.property('project')

});