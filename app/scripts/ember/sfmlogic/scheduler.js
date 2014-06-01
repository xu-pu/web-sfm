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

    var busyThreads = Ember.A();

    var inProgress = Ember.A();

    /*
    while(!dataIter.isEnded()){
        dataIter.next(function(data, key){
     console.log(key);
            finished.addObject(key);
        });
    }

    callback();
*/
    initialize();

    function initialize(){
//        project.addObserver('threadPoolSize', onPoolSizeChange);
//        project.addObserver('state', abort);

        var newThread;
        while(!dataIter.isEnded() && threadPool.length < project.get('threadPoolSize')){
            newThread = new App.Thread();
            newThread.start();
            threadPool.addObject(newThread);
            busyThreads.addObject(newThread);
            assign(newThread);
        }
    }

    function oneDone(result, key, thread){
        IDBAdapter.promiseSetData(SFM.STORE_MATCHES, key, result).then(function(){
            inProgress.removeObject(key);
            finished.addObject(key);
            if (dataIter.isEnded()) {
                thread.stop();
                threadPool.removeObject(thread);
                busyThreads.removeObject(thread);
                if (busyThreads.length === 0) {
                    callback();
                }
            }
            else {
                assign(thread);
            }
        });
    }

    function assign(thread){
        dataIter.next(function(data, key){
            console.log(key);
            inProgress.addObject(key);
            thread.calculate(task, data, key, oneDone);
        });
    }

    function resume(){}

    function abort(){}

    function onPoolSizeChange(){}

    return {
        finished: finished,
        inProgress: inProgress
    };

};