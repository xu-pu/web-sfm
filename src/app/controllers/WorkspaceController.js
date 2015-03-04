"use strict";

var _ = require('underscore');

var Image = require('../models/Image.js'),
    utils = require('../utils.js'),
    settings = require('../settings.js'),
    STORES = settings.STORES,
    RESOURCE = settings.RESOURCE;

module.exports = Ember.ObjectController.extend({

    needs: ['context', 'projectResource'],

    resource: Ember.computed.alias('controllers.projectResource'),

    adapter: Ember.computed.alias('controllers.context.adapter'),

    isRunning: false,

    threadPoolSize: 4,

    expandInput: true,
    expandProgress: true,
    expandRegister: true,
    expandStereo: true,

    onSwitchProject: function(){
        this.set('imageModels', null);
    }.observes('model'),


    actions: {

        enter: function(route){
            this.transitionToRoute(route);
        },

        back: function(){
            this.transitionToRoute('welcome');
        },

        toggleMenu: function(name){
            switch (name) {
                case 'input':
                    this.set('expandInput', !this.get('expandInput'));
                    break;
                case 'progress':
                    this.set('expandProgress', !this.get('expandProgress'));
                    break;
                case 'register':
                    this.set('expandRegister', !this.get('expandRegister'));
                    break;
                case 'stereo':
                    this.set('expandStereo', !this.get('expandStereo'));
                    break;
                default:
                    throw "invalid menu toggle";
            }
        }

    },

    /**
     * @returns {Promise}
     */
    promiseImages: function(){

        return this.get('resource')
            .promiseResource(RESOURCE.IMAGES)
            .then(function(images){
                return images.map(function(image){
                    return Image.create(image);
                })
            });

    },


    /**
     * Return all tracks stored in IDB
     * @returns {Promise}
     */
    promiseTracks: function(){
        var adapter = this.get('adapter');
        return Promise.all([
            this.promiseImages(),
            adapter.promiseData(STORES.SINGLETONS, STORES.TRACKS),
            adapter.promiseData(STORES.SINGLETONS, STORES.VIEWS)
        ]).then(function(values){
            return Promise.resolve({
                images: values[0],
                tracks: values[1],
                views: values[2]
            });
        });
    },


    /**
     * Return all matches stored in IDB
     * @returns {Promise}
     */
    promiseMatches: function(){

        return this.get('adapter')
            .promiseAll(STORES.MATCHES)
            .then(function(results){
                return results.map(function(entry){
                    var value = entry.value;
                    value._id = entry.key;
                    return value;
                });
            });

    }

});