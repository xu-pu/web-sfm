'use strict';

var ProjectModel = require('../models/Project.js');

module.exports = Ember.ArrayController.extend({

    itemController: 'project.thumbnail',

    needs: ['sfmStore'],

    store: Ember.computed.alias('controllers.sfmStore'),

    newProjectName: 'new-project',

    isValidName: function(){
        var name = this.get('newProjectName');
        return name !== '' && this.get('store').nameAvaliable(name);
    }.property('newProjectName'),

    actions: {

        createProject: function(){
            if (this.get('isValidName')) {
                this.get('store.projects')
                    .pushObject(ProjectModel.create({
                        name: this.get('newProjectName')
                    }));
            }
        },

        enter: function(project){
            var store = this.get('store');
            store.set('currentProject', project);
            this.transitionToRoute('workspace');
        }

    }

});