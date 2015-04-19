'use strict';

var _ = require('underscore');

var Project = require('../models/Project.js'),
    IDBAdapter = require('../store/StorageAdapter.js'),
    utils = require('../utils.js'),
    settings = require('../settings.js'),
    LOCAL_STORES = settings.LOCAL_STORE,
    demos = require('../../../demo/demos.js'),
    DemoProject = require('../models/DemoProject.js');


module.exports = Ember.Controller.extend({

    projects: [],

    demos: [],

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


    initRecover: function(){

        // Recover Projects

        var storedProjects = utils.getLocalStorage(LOCAL_STORES.PROJECTS);

        if (_.isArray(storedProjects)) {
            this.set('projects', storedProjects.map(function(p){
                return Project.create(p);
            }));
        }

        // Recover Demos
/*
        var storedDemos = utils.getLocalStorage(LOCAL_STORES.DEMOS),
            recoveredDemos = [];

        if (_.isArray(storedDemos)) {
            recoveredDemos = storedDemos.map(function(p){
                return DemoProject.create(p);
            });
        }

        var additionalDemos = demos
            .filter(function(d){
                return !recoveredDemos.findBy('name', d.name);
            })
            .map(function(config){
                return DemoProject.create(config.description)
            });

        this.set('demos', recoveredDemos.concat(additionalDemos));

        this.send('syncDemos');
*/

        this.set('demos', demos.map(function(config){ return DemoProject.create(config.description); }));

        // Recover Current Project

        var currentProject,
            projectName = localStorage.getItem(LOCAL_STORES.PROJECT);

        if (_.isString(projectName)) {
            currentProject = this.get('projects').findBy('name', projectName) || this.get('demos').findBy('name', projectName) || null;
            this.set('currentProject', currentProject);
        }


    }.on('init'),


    /**
     * sync projects to localstrorage when new ones added
     */
    watchProjects: function(){
        this.send('syncProjects');
    }.observes('projects.length'),

    actions: {

        enter: function(project){
            this.set('currentProject', project);
            this.transitionToRoute('workspace');
        },

        createProject: function(project){
            this.get('projects').pushObject(project);
        },

        syncDemos: function(){
            utils.setLocalStorage(LOCAL_STORES.DEMOS, this.get('demos')
                .map(function(model){
                    return model.getProperties(model.get('storedProperties'));
                }));
        },

        syncProjects: function(){
            utils.setLocalStorage(LOCAL_STORES.PROJECTS, this.get('projects')
                .map(function(model){
                    return model.getProperties(model.get('storedProperties'));
                }));
        }

    }

});