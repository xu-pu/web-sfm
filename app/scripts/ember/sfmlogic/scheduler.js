'use strict';

/**
 * @typedef {{next: Function, ended: boolean}} Iterator
 */

/**
 *
 * @param project
 * @param {number} task
 * @param {Iterator} dataIter
 * @param {Ember.MutableArray} finished
 * @param {Function} callback
 */
App.schedule = function(project, task, dataIter, finished, callback){

    var threadPool = project.get('threads');

    var dataPool = [];

    var inProgress = Ember.A();

    while(!dataIter.isEnded()){
        dataIter.next(function(data){
            console.log(data.key);
            finished.addObject(data.key);
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