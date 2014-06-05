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

    var dataPool = Ember.A();

    var busyThreads = Ember.A();

    var inProgress = Ember.A();

    var allAssigned = false;

    initialize();

    function initialize(){
        if (dataIter.isEnded()) {
            callback();
        }
        else {
            project.addObserver('threadPoolSize', function(){
                if (project.get('state') === SFM.STATE_RUNNING) {
                    onPoolSizeChange();
                }
            });
            project.addObserver('state', function(){
                if (busyThreads.length === 0 && project.get('state') === SFM.STATE_RUNNING) {
                    resume();
                }
                else if (project.get('state') === SFM.STATE_STOPPED) {
                    pause();
                }
            });
            assignAll();
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

    function assignAll(){
        allAssigned = dataIter.isEnded() && dataPool.length === 0;
        var newThread;
        while(threadPool.length < project.get('threadPoolSize') && !allAssigned){
            newThread = new App.Thread();
            newThread.start();
            threadPool.addObject(newThread);
            busyThreads.addObject(newThread);
            assign(newThread);
        }
    }

    function assign(thread){
        if (dataPool.length > 0) {
            Ember.Logger.debug(dataPool[0].key + ' assigned');
            inProgress.addObject(dataPool[0].key);
            thread.calculate(task, dataPool[0].data, dataPool[0].key, oneDone);
            dataPool.removeAt(0);
        }
        else if (!dataIter.isEnded()) {
            dataIter.next(function(data, key){
                Ember.Logger.debug(key + ' assigned');
                inProgress.addObject(key);
                thread.calculate(task, data, key, oneDone);
            });
        }
    }

    function pauseOne(thread){
        inProgress.removeObject(thread.get('metadata'));
        dataPool.push({
            key: thread.get('metadata'),
            data: thread.get('data')
        });
        thread.stop();
        threadPool.removeObject(thread);
        busyThreads.removeObject(thread);

    }

    function resume(){
        assignAll();
    }

    function pause(){
        while (busyThreads.length > 0) {
            pauseOne(busyThreads[0]);
        }
    }

    function onPoolSizeChange(){
        var newSize = project.get('threadPoolSize');
        var currentSize = threadPool.length;
        if (newSize>currentSize) {
            assignAll();
        }
        else if (newSize<currentSize) {
            busyThreads.slice(0,currentSize-newSize).forEach(pauseOne);
        }
    }

    return {
        inProgress: inProgress
    };

};