'use strict';

var ProjectModel = require('../models/Project.js');

module.exports = Ember.ArrayController.extend({

    itemController: 'project.thumbnail',

    needs: ['application'],

    newProjectName: 'new-project',

    store: Ember.computed.alias('controllers.application.model'),

    isValidName: function(){
        return this.get('store').nameAvaliable(this.get('newProjectName'));
    }.property('newProjectName'),

    actions: {
        createProject: function(){
            if (this.get('isValidName')) {
                this.get('store.projects')
                    .pushObject(ProjectModel.create({
                        name: this.get('newProjectName')
                    }));
            }
        }
    }

});