'use strict';

var _ = require('underscore');

var Project = require('../models/Project.js'),
    IDBAdapter = require('../store/StorageAdapter.js'),
    utils = require('../utils.js'),
    settings = require('../settings.js'),
    LOCAL_STORES = settings.LOCAL_STORE;


module.exports = Ember.Controller.extend({

    needs: ['demos'],

    projects: [],

    demos: Ember.computed.alias('controllers.demos'),

    currentProject: null,

    adapter: null,

    /**
     * sync adapter and localstorage when current project changed
     */
    onSwichProject: function(){

        Ember.Logger.debug('project switch triggered!');

        var project = this.get('currentProject'),
            oldadapter = this.get('adapter');

        // release old connection
        if (oldadapter) {
            oldadapter.close();
            this.set('adapter', null);
        }

        // establish new connection
        if (project) {
            this.set('adapter', new IDBAdapter(project.get('name')));
        }

        // sync to localstorage
        if (project) {
            localStorage.setItem(LOCAL_STORES.PROJECT, project.get('name'));
        }
        else {
            localStorage.removeItem(LOCAL_STORES.PROJECT);
        }

    }.observes('currentProject'),


    /**
     * resolve or reject based on the presence of currentProject
     * @returns {Promise}
     */
    promiseProject: function(){
        var project = this.get('currentProject');
        if (project === null) {
            return Promise.reject();
        }
        else {
            return Promise.resolve(project);
        }
    },


    promiseDeleteProject: function(project){

        var _self = this,
            currentProject = this.get('currentProject');

        if (currentProject && currentProject.get('name') === project.get('name')) {
            this.set('currentProject', null);
        }

        return new Promise(function(resolve, reject){
            _self.set('isDeleting', true);
            var request = indexedDB.deleteDatabase(project.get('name'));
            request.onsuccess = function(){
                _self.get('projects').removeObject(project);
                resolve(project);
            };
        });

    },


    /**
     * check is name avaliable or not
     * @param {string} name
     * @returns {Boolean}
     */
    nameAvaliable: function(name){
        var demos = this.get('demos'),
            projects = this.get('projects');
        return _.isUndefined(demos.findBy('name', name)) && _.isUndefined(projects.findBy('name', name));
    },


    recover: function(){

        var currentProject,
            project = localStorage.getItem(LOCAL_STORES.PROJECT);

        if (_.isString(project)) {
            currentProject = this.get('projects').findBy('name', project) || this.get('demos.model').findBy('name', project) || null;
            this.set('currentProject', currentProject);
        }

    }.on('init'),

    recoverProjects: function(){

        var data = utils.getLocalStorage(LOCAL_STORES.PROJECTS),
            content = [];

        if (_.isArray(data)) {
            content = data.map(function(p){
                return Project.create(p);
            });
        }

        this.set('projects', content);

    }.on('init'),


    /**
     * sync projects to localstrorage when new ones added
     */
    syncProjects: function(){
        utils.setLocalStorage(LOCAL_STORES.PROJECTS, this.get('projects')
            .map(function(model){
                return model.getProperties(model.get('storedProperties'));
            }));
    }.observes('projects.length'),

    actions: {

        enter: function(project){
            var context = this.get('context');
            context.set('currentProject', project);
            this.transitionToRoute('workspace');
        },

        createProject: function(project){
            this.get('projects').pushObject(project);
        }

    }

});