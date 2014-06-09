'use strict';

App.SfmLogic = (function(){

    var projectModel = null;
    var threadPool = null;

    var state = SFM.STATE_STOPPED;

    App.SfmStore.promiseProject().then(function(project){
        projectModel = project;
        threadPool = projectModel.get('threads');
        projectModel.addObserver('state', onStateChange);
        projectModel.addObserver('stage', onStageChange);
    });

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
        var imageModels;

        if (projectModel.get('SIFT_SOURCE') === SFM.DATA_SOURCE_TEST) {
            App.SfmStore.promiseImages().then(function(imgs){
                imageModels = imgs;
                imgs.forEach(function(img){
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

    function matchingLogic(callback){
        App.SfmStore.promiseMatches().then(function(matchesModel){
            matchesModel.scheduleMatching(callback);
        });
    }

    function trackingLogic(callback){
        var matches = [];
        var thread;
        IDBAdapter.queryEach(SFM.STORE_MATCHES, function(key, value){
            var cam1 = parseInt(key.split('&')[0]);
            var cam2 = parseInt(key.split('&')[1]);
            matches.push({
                matches: value,
                cam1: cam1,
                cam2: cam2
            });
        }, function(){
            thread = App.Thread.create({});
            threadPool.addObject(thread);
            thread.start();
            thread.calculate(SFM.TASK_TRACKING, matches, null, function(data){
                thread.stop();
                threadPool.removeObject(thread);
                Ember.Logger.debug('thread deleted');
                Ember.Logger.debug(data);
                Promise.all([
                    IDBAdapter.promiseSetData(SFM.STORE_SINGLETONS, SFM.STORE_TRACKS, data.tracks),
                    IDBAdapter.promiseSetData(SFM.STORE_SINGLETONS, SFM.STORE_VIEWS, data.views)
                ]).then(function(){
                    Ember.Logger.debug('stored');
                    callback();
                }, function(){
                    Ember.Logger.debug('rejected');
                });
            })
        })
    }

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
                matchingLogic(function(){
                    projectModel.set('stage', SFM.STAGE_TRACKING);
                });
                break;
            case SFM.STAGE_TRACKING:
                trackingLogic(function(){
                    projectModel.set('stage', SFM.STAGE_REGISTER);
                });
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

    function run(){
        Ember.Logger.debug('sfm main logic started');
        onStageChange();
    }

    function stop(){
        Ember.Logger.debug('sfm main logic stopped');
    }

}());