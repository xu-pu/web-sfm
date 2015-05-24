'use strict';

var Image = require('../models/Image.js');

module.exports = Ember.Controller.extend({

    needs: ['workspace'],

    adapter: Ember.computed.alias('controllers.workspace.adapter'),

    project: Ember.computed.alias('controllers.workspace.project'),

    images: Ember.computed.alias('model'),

    queue: [],

    canImport: function(){
        return !this.get('project.isDemo');
    }.property('project.isDemo'),

    actions: {

        expand: function(model){
            this.transitionToRoute('workspace.images.detail', model);
        }

    },

    inProgress: function(){
        return this.get('queue.length') !== 0;
    }.property('queue.length'),

    importImageFile: function(file){
        var _self = this,
            adapter = this.get('adapter'),
            queue = this.get('queue');

        queue.addObject(file);
        adapter
            .processImageFile(file)
            .then(function(image){
                queue.removeObject(file);
                _self.get('model').pushObject(Image.create(image));
            })
    }

});