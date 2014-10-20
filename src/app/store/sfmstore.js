'use strict';

var _ = require('underscore');

var utils = require('../utils.js'),
    Project = require('../models/Project.js'),
    DemoProject = require('../models/DemoProject.js'),
    IDBAdapter = require('./StorageAdapter.js');

var DEMO_LIST_URL = '/demo/demos.json';

var LOCAL_STORE = {
    DEMOS: 'demos',
    PROJECTS: 'projects',
    PROJECT: 'project'
};

//============================================

var Store = Ember.Object.extend({

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
        utils.setLocalStorage(LOCAL_STORE.PROJECTS, this.get('demos').map(function(model){
            return model.getProperties(model.get('storedProperties'));
        }));
    }.observes('projects.length'),

    nameAvaliable: function(name){
        var demos = this.get('demos'),
            projects = this.get('projects');
        return _.isUndefined(demos.findBy('name', name)) && _.isUndefined(projects.findBy('name', name));
    }

});

var ready = initLocalStorage().then(initStore);

//==========================================
// All functionalities of sfmstore is
// in the Store Object
//==========================================

module.exports.storePromise = ready;

//==========================================
// Shortcuts
//==========================================

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
        store.syncDemos();
    });
};

module.exports.promiseAdapter = function(){
    return ready.then(function(store){
        return store.get('adapter');
    });
};

//============================================

function initLocalStorage(){
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