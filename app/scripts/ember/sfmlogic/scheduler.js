'use strict';

/**
 * @typedef {{next: Function, isEnded: Function}} Iterator
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

//    var dataPool = [];

    var inProgress = Ember.A();

    while(!dataIter.isEnded()){
        dataIter.next(function(data, key){
            console.log(key);
            finished.addObject(key);
        });
    }

    callback();

    function initialize(){
//        project.addObserver('threadPoolSize', onPoolSizeChange);
//        project.addObserver('state', abort);

        var newThread;
        while(!dataIter.isEnded() && threadPool.length < project.get('threadPoolSize')){
            dataIter.next(function(data, key){
                newThread = new App.Thread();
                newThread.start();
                inProgress.addObject(key);
                newThread.calculate(task, data, oneDone);
            });
        }
    }

    function assign(thread, data){

    }

    function oneDone(){}

    function resume(){}

    function abort(){}

    function onPoolSizeChange(){}

    return {
        finished: finished,
        inProgress: inProgress
    };

};