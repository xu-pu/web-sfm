'use strict';

var _ = require('underscore');

var utils = require('../utils.js'),
    Project = require('../models/Project.js'),
    DemoProject = require('../models/DemoProject.js');

var DEMO_LIST_URL = '/demo/demos.json';

//============================================

var resumed = promiseResume();
var sfmstoreProject = null,
    sfmstoreProjects = null,
    sfmstoreDemos = null;

//============================================
// Projects have state, Demos don't
// demo is added to projects when loaded
//============================================

module.exports.promiseDemos = function(){
    return resumed.then(function(){
        return sfmstoreDemos;
    });
};

module.exports.promiseProjects = function(){
    return resumed.then(function(){
        return sfmstoreProjects;
    });
};

module.exports.promiseProject = function(){
    return resumed.then(function(){
        if (sfmstoreProject === null) {
            return Promise.reject();
        }
        else {
            return Promise.resolve(sfmstoreProject);
        }
    });
};

module.exports.setCurrentProject = function(project){
    sfmstoreProject = project;
    localStorage.setItem('project', project.get('name'));
};

module.exports.syncDemos = function(){
    resumed.then(function(){
        utils.setLocalStorage('demos', sfmstoreDemos.map(function(model){
            return model.getProperties(model.get('storedProperties'));
        }));
    });
};

//============================================

function promiseResume(){
    return promiseLocalStore()
        .catch(initialize)
        .then(function(demos, projects, project){
            sfmstoreDemos = demos.map(function(d){
                return DemoProject.create(d);
            });
            if (!_.isArray(projects)) {
                sfmstoreProjects = [];
            }
            else {
                sfmstoreProjects = projects.map(function(p){
                    return Project.create(p);
                });
            }
            if (_.isString(project)) {
                sfmstoreProject = projects.findBy('name', project) || null;
            }
            return Promise.resolve();
        });
}

function initialize(){
    return utils.requireJSON(DEMO_LIST_URL).then(function(demos){
        utils.setLocalStorage('demos', demos);
        return Promise.resolve(demos);
    });
}

function promiseLocalStore(){
    return new Promise(function(resolve, reject){
        var demos = utils.getLocalStorage('demos'),
            projects = utils.getLocalStorage('projects'),
            project = localStorage.getItem('project');
        if (demos === null) {
            reject();
        }
        else {
            resolve(demos, projects, project);
        }
    });
}
