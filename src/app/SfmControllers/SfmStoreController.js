'use strict';


var _ = require('underscore');


var utils = require('../utils.js'),
    Project = require('../models/Project.js'),
    DemoProject = require('../models/DemoProject.js'),
    IDBAdapter = require('../store/StorageAdapter.js');


var DEMO_LIST_URL = '/demo/demos.json';


var LOCAL_STORE = {
    DEMOS: 'demos',
    PROJECTS: 'projects',
    PROJECT: 'project'
};


module.exports = Ember.Controller.extend({

    currentProject: null, // Obj

    projects: [],

    demos: [],

    adapter: null,



    onSwichProject: function(){
        Ember.Logger.debug('project switch triggered!');
        var project = this.get('currentProject');
        if (project) {
            this.set('adapter', new IDBAdapter(project.get('name')));
            localStorage.setItem(LOCAL_STORE.PROJECT, project.get('name'));
        }
        else {
            this.set('adapter', null);
            localStorage.setItem(LOCAL_STORE.PROJECT, null);
        }
    }.observes('currentProject'),



    syncDemos: function(){
        utils.setLocalStorage(LOCAL_STORE.DEMOS, this.get('demos').map(function(model){
            return model.getProperties(model.get('storedProperties'));
        }));
    },



    syncProjects: function(){
        utils.setLocalStorage(LOCAL_STORE.PROJECTS, this.get('projects').map(function(model){
            return model.getProperties(model.get('storedProperties'));
        }));
    }.observes('projects.length'),



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



    promiseResume: function(){
        return this.initLocalStorage().then(this.initStore.bind(this));
    },



    /**
     * resume data from localstorage and server, before initialize the SfmStore
     * @returns {Promise}
     */
    initLocalStorage: function(){
        var demos = utils.getLocalStorage(LOCAL_STORE.DEMOS),
            projects = utils.getLocalStorage(LOCAL_STORE.PROJECTS),
            project = localStorage.getItem(LOCAL_STORE.PROJECT);
        if (demos === null) {
            return utils
                .requireJSON(DEMO_LIST_URL)
                .then(function(resp){
                    utils.setLocalStorage('demos', resp);
                    return Promise.resolve([resp, null, null]);
                });
        }
        else {
            return Promise.resolve([demos, projects, project]);
        }
    },



    /**
     * initialize properties of the SfmStore, called after localstorage is resumed
     * @param results
     */
    initStore: function(results){
        var demos = results[0],
            projects = results[1],
            project = results[2];

        var params = {};

        // init Demos
        params.demos = demos.map(function(d){
            return DemoProject.create(d);
        });

        // init Projects
        if (_.isArray(projects)) {
            params.projects = projects.map(function(p){
                return Project.create(p);
            });
        }

        // init currentProject
        if (_.isString(project)) {
            params.currentProject = params.projects.findBy('name', project) || params.demos.findBy('name', project) || null;
        }
        if (params.currentProject) {
            params.adapter = new IDBAdapter(params.currentProject.get('name'));
        }

        this.setProperties(params);

    }

});
