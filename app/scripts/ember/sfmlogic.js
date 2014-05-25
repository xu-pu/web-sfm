'use strict';

App.SfmLogic = (function(){

    var projectModel = null;

    var imageModels = null;

    var threadPool = null;

    var state = SFM.STATE_STOPPED;

    initialize();

    function initialize(){
        /*
        var appState;
        if (localStorage.getItem()) {
            appState = JSON.parse(localStorage.getItem());
        }
        else {

        }
        */
        projectModel = App.Project.create({
            type: SFM.PROJECT_TYPE_TEST,
            name: 'test'
        });
        projectHooks();
        threadPool = projectModel.get('threads');
        _.range(projectModel.get('threadPoolSize')).forEach(function(){
            threadPool.addObject(App.Thread.create({}));
        });
    }

    function projectHooks(){
        projectModel.addObserver('state', onStateChange);
        projectModel.addObserver('threadPoolSize', onThreadPoolSizeChange);
    }

    function onStateChange(sender, key, value, rev){
        console.log('change detected');
        var lastState = state;
        state = projectModel.get('state');
        if (lastState === SFM.STATE_STOPPED && state === SFM.STATE_RUNNING) {
            run();
        }
        else if (state === SFM.STATE_STOPPED && lastState === SFM.STATE_RUNNING) {
            stop();
        }
    }

    function onThreadPoolSizeChange(sender, key, value, rev){
        if (value > rev) {
            // increased
            _.range(value-rev).forEach(function(){
                threadPool.addObject(App.Thread.create({}));
            });
        }
        else if (value < rev) {
            // decreased
            _.range(rev-value).forEach(function(){
                var thread = threadPool.get('lastObject').stop();
                threadPool.removeObject(thread);
            });
        }
        else {
            console.log('thread pool size is not changed');
        }
    }

    function promiseImages(){
        return new Ember.RSVP.Promise(function(resolve){
            if (imageModels){
                resolve(imageModels);
            }
            else {
                imageModels = Ember.A();
                IDBAdapter.queryEach('images',
                    function(key, value){
                        value._id = key;
                        imageModels.addObject(App.Image.create(value));
                    },
                    function(){
                        resolve(imageModels);
                    }
                );
            }
        });
    }

    function promiseProject() {
        return new Ember.RSVP.Promise(function(resolve, reject){
            resolve(projectModel);
        });
    }

    function run(){
        console.log('started');
    }

    function stop(){
        console.log('stopped');
    }

    return {
        promiseProject: promiseProject,
        promiseImages: promiseImages
    };

}());