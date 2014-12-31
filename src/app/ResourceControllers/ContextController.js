'use strict';

var _ = require('underscore');

var IDBAdapter = require('../store/StorageAdapter.js'),
    utils = require('../utils.js'),
    settings = require('../settings.js'),
    LOCAL_STORES = settings.LOCAL_STORE;


module.exports = Ember.Controller.extend({

    needs: ['projects', 'demos'],

    projects: Ember.computed.alias('controllers.projects'),

    demos: Ember.computed.alias('controllers.demos'),

    currentProject: null,


    /**
     * sync adapter and localstorage when current project changed
     */
    onSwichProject: function(){

        Ember.Logger.debug('project switch triggered!');

        var project = this.get('currentProject');

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
            currentProject = this.get('projects.model').findBy('name', project) || this.get('demos.model').findBy('name', project) || null;
            this.set('currentProject', currentProject);
        }

    }.on('init')

});