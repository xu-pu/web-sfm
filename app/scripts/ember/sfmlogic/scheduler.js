'use strict';

/**
 * @typedef {{next: Function, ended: boolean}} Iterator
 */

/**
 *
 * @param project
 * @param {number} task
 * @param {Iterator} dataIter
 * @param {Function} progress
 * @param {Function} callback
 */
App.schedule = function(project, task, dataIter, progress, callback){

    var threadPool = project.get('threads');

    var dataPool = [];

    var finished = Ember.A();

    var inProgress = Ember.A();

    while(!dataIter.isEnded()){
        dataIter.next(function(data){
            progress(data.key);
        });
    }

    callback();

    function initialize(){
//        project.addObserver('threadPoolSize', onPoolSizeChange);
//        project.addObserver('state', abort);

    }

    function oneDone(){}

    function abort(){}

    function onPoolSizeChange(){}

    return {
        finished: finished,
        inProgress: inProgress
    };

};