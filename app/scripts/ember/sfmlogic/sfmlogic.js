'use strict';

App.SfmLogic = (function(){

    var projectModel = null;

    var imageModels = null;

    var threadPool = null;

    var state = SFM.STATE_STOPPED;

    initialize();

    function initialize(){
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
        projectModel.addObserver('stage', onStageChange);
    }

    function onStateChange(){
        console.log('state change detected');
        var lastState = state;
        state = projectModel.get('state');
        if (lastState === SFM.STATE_STOPPED && state === SFM.STATE_RUNNING) {
            run();
        }
        else if (state === SFM.STATE_STOPPED && lastState === SFM.STATE_RUNNING) {
            stop();
        }
    }

    function extractorLogic(callback) {
        var finished = 0;
        if (projectModel.get('SIFT_SOURCE') === SFM.DATA_SOURCE_TEST) {
            imageModels.forEach(function(img){
                IDBAdapter.promiseData(SFM.STORE_FEATURES, img.get('_id')).then(oneDone, function(){
                    // not exist
                    var name = img.get('filename').split('.')[0];
                    Ember.Logger.debug('ask ajax for sift');
                    getSiftSample(name, function(data){
                        Ember.Logger.debug('ajax sift returned');
                        IDBAdapter.promiseSetData(SFM.STORE_FEATURES, img.get('_id'), data.features).then(oneDone);
                    });
                });
            });
        }
        else {
            throw 'SIFT has not been implemented yet';
        }

        function oneDone(){
            Ember.Logger.debug('SIFT one done');
            finished++;
            if (finished === imageModels.length) {
                callback();
            }
        }
    }

    function matchingLogic(){}

    function onStageChange(){
        console.log('state change detected');
        switch (projectModel.get('stage')) {
            case SFM.STAGE_BEFORE:
                projectModel.set('stage', SFM.STAGE_EXTRACTOR);
                break;
            case SFM.STAGE_EXTRACTOR:
                extractorLogic(function(){
                    projectModel.set('stage', SFM.STAGE_MATCHING);
                });
                break;
            case SFM.STAGE_MATCHING:
                break;
            case SFM.STAGE_TRACKING:
                break;
            case SFM.STAGE_REGISTER:
                break;
            case SFM.STAGE_STEREO:
                break;
            case SFM.STAGE_MVS:
                break;
            case SFM.STAGE_AFTER:
                break;
            default:
                throw 'invalid project stage';
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
        Ember.Logger.debug('sfm main logic started');
        onStageChange();
    }

    function stop(){
        Ember.Logger.debug('sfm main logic stopped');
    }


    return {
        promiseProject: promiseProject,
        promiseImages: promiseImages
    };

}());