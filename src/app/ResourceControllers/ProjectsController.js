'use strict';

var _ = require('underscore');

var ProjectModel = require('../models/Project.js'),
    utils = require('../utils.js'),
    settings = require('../settings.js'),
    LOCAL_STORES = settings.LOCAL_STORE;

module.exports = Ember.ArrayController.extend({

    needs: 'context',

    context: Ember.computed.alias('controllers.context'),

    itemController: 'project',

    newProjectName: 'new-project',

    isValidName: function(){
        var name = this.get('newProjectName'),
            contex = this.get('context');
        return name !== '' && contex.nameAvaliable(name);
    }.property('newProjectName'),


    actions: {

        createProject: function(){
            if (this.get('isValidName')) {
                this.get('model').pushObject(ProjectModel.create({
                    name: this.get('newProjectName')
                }));
            }
        },

        enter: function(project){
            var context = this.get('context');
            context.set('currentProject', project);
            this.transitionToRoute('workspace');
        }

    },


    recover: function(){

        var data = utils.getLocalStorage(LOCAL_STORES.PROJECTS),
            content = [];

        if (_.isArray(data)) {
            content = data.map(function(p){
                return ProjectModel.create(p);
            });
        }

        this.set('model', content);

    }.on('init'),


    /**
     * sync projects to localstrorage when new ones added
     */
    syncProjects: function(){
        utils.setLocalStorage(LOCAL_STORES.PROJECTS, this.get('model')
            .map(function(model){
                return model.getProperties(model.get('storedProperties'));
            }));
    }.observes('projects.length')

});