'use strict';

var _ = require('underscore');

var utils = require('../utils.js'),
    Project = require('../models/Project.js'),
    DemoProject = require('../models/DemoProject.js'),
    IDBAdapter = require('./StorageAdapter.js');

var DEMO_LIST_URL = '/demo/demos.json';

//============================================

var Store = Ember.Object.extend({

    currentProject: null,

    projects: null,

    demos: null,

    adapter: null,

    onSwichProject: function(){
        Ember.Logger.debug('project switch triggered!');
        var project = this.get('currentProject');
        if (project) {
            this.set('adapter', new IDBAdapter(project.get('name')));
            localStorage.setItem('project', project.get('name'));
            console.log(this.get('adapter'));
        }
    }.observes('currentProject')

});

var ready = initLocalStorage().then(initStore);

//============================================
// Projects have state, Demos don't
// demo is added to projects when loaded
//============================================

module.exports.promiseDemos = function(){
    return ready.then(function(store){
        return store.get('demos');
    });
};

module.exports.promiseProjects = function(){
    return ready.then(function(store){
        return store.get('projects');
    });
};

module.exports.promiseProject = function(){
    return ready.then(function(store){
        var project = store.get('currentProject');
        if (project === null) {
            return Promise.reject();
        }
        else {
            return Promise.resolve(project);
        }
    });
};

module.exports.setCurrentProject = function(project){
    ready.then(function(store){
        store.set('currentProject', project);
    });
};

module.exports.syncDemos = function(){
    ready.then(function(store){
        utils.setLocalStorage('demos', store.get('demos').map(function(model){
            return model.getProperties(model.get('storedProperties'));
        }));
    });
};

/**
 * return the adapter for current project
 */
module.exports.promiseAdapter = function(){
    return ready.then(function(store){
        return store.get('adapter');
    });
};

//============================================

function initLocalStorage(){
    var demos = utils.getLocalStorage('demos'),
        projects = utils.getLocalStorage('projects'),
        project = localStorage.getItem('project');
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
}

function initStore(results){
    var demos = results[0],
        projects = results[1],
        project = results[2];

    var params = {
        currentProject: null,
        projects: null,
        demos: null,
        adapter: null
    };

    // init Demos
    params.demos = demos.map(function(d){
        return DemoProject.create(d);
    });

    // init Projects
    if (!_.isArray(projects)) {
        params.projects = [];
    }
    else {
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

    return Store.create(params);

}