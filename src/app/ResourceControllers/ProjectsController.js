'use strict';

var _ = require('underscore');

var ProjectModel = require('../models/Project.js'),
    utils = require('../utils.js'),
    settings = require('../settings.js'),
    LOCAL_STORES = settings.LOCAL_STORE;

module.exports = Ember.ArrayController.extend({


    itemController: 'project',


    /**
     * sync projects to localstrorage when new ones added
     */
    syncProjects: function(){
        utils.setLocalStorage(LOCAL_STORES.PROJECTS, this.get('model')
            .map(function(model){
                return model.getProperties(model.get('storedProperties'));
            }));
    }.observes('projects.length'),


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


    },


    init: function(){

        this._super();

        var data = utils.getLocalStorage(LOCAL_STORES.PROJECTS),
            content = [];

        if (_.isArray(data)) {
            content = data.map(function(p){
                return Project.create(p);
            });
        }

        this.set('model', content);

    }

});