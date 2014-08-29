'use strict';

var _ = require('underscore');

var utils = require('../utils.js'),
    Project = require('../models/Project.js'),
    DemoProject = require('../models/DemoProject.js');

var DEMO_LIST_URL = '/demo/demos.json';

//============================================

var resumed = promiseResume();
var currentProject = null;

//============================================
// Projects have state, Demos don't
// demo is added to projects when loaded
//============================================

module.exports.promiseDemos = function(){
    return resumed.then(function(results){
        return results[0];
    });
};

module.exports.promiseProjects = function(){
    return resumed.then(function(results){
        return results[1];
    });
};

module.exports.promiseProject = function(){
    return resumed.then(function(){
        if (currentProject === null) {
            return Promise.reject();
        }
        else {
            return Promise.resolve(currentProject);
        }
    });
};

module.exports.setCurrentProject = function(project){
    currentProject = project;
    localStorage.setItem('project', project.get('name'));
};

//============================================

function promiseResume(){
    return promiseLocalStore()
        .catch(initialize)
        .then(function(demos, projects, project){
            demos = demos.map(function(d){
                return DemoProject.create(d);
            });
            if (!_.isArray(projects)) {
                projects = [];
            }
            else {
                projects = projects.map(function(p){
                    return Project.create(p);
                });
            }
            if (_.isString(project)) {
                currentProject = projects.findBy('name', project) || null;
            }
            return Promise.resolve([demos, projects, currentProject]);
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
