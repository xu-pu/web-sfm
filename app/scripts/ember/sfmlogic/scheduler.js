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

    function initialize(){
        project.addObserver('threadPoolSize', onPoolSizeChange);
        project.addObserver('state', abort);
    }

    function oneDone(){}

    function abort(){}

    function onPoolSizeChange(){}

};