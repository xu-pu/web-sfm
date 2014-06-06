'use strict';

App.SfmLogic = (function(){

    var projectModel = null;
    var imageModels = null;
    var matchesModel = null;

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
            promiseImages().then(function(imgs){
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
        promiseMatches().then(function(matchesModel){
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
                Ember.Logger.debug(data);
                Promise.all([
                    IDBAdapter.promiseSetData(SFM.STORE_SINGLETONS, SFM.STORE_TRACKS, data.tracks),
                    IDBAdapter.promiseSetData(SFM.STORE_SINGLETONS, SFM.STORE_VIEWS, data.views)
                ]).then(function(){
                    thread.stop();
                    threadPool.removeObject(thread);
                    callback();
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

    /**
     * @returns {Promise}
     */
    function promiseImages(){
        return new Promise(function(resolve){
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

    /**
     * @returns {Promise}
     */
    function promiseProject() {
        return new Promise(function(resolve, reject){
            resolve(projectModel);
        });
    }

    /**
     *
     * @returns {Promise}
     */
    function promiseMatches(){
        return new Promise(function(resolve, reject){
            if (matchesModel) {
                resolve(matchesModel);
            }
            else {
                promiseImages().then(function(imgs){
                    var storedMatches = [];
                    IDBAdapter.queryEach(SFM.STORE_MATCHES, function(key, value){
                        storedMatches.push(key);
                    }, function(){
                        matchesModel = App.Matches.create({
                            images: imgs,
                            finished: storedMatches
                        });
                        resolve(matchesModel);
                    });
                });
            }
        });
    }

    function promiseTracks(){
        return new Promise(function(resolve, reject){
            Promise.all([
                promiseImages(),
                IDBAdapter.promiseData(SFM.STORE_SINGLETONS, SFM.STORE_TRACKS),
                IDBAdapter.promiseData(SFM.STORE_SINGLETONS, SFM.STORE_VIEWS)
            ]).then(function(values){
                resolve({
                    images: values[0],
                    tracks: values[1],
                    views: values[2]
                });
            }, reject);
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
        promiseImages: promiseImages,
        promiseMatches: promiseMatches,
        promiseTracks: promiseTracks
    };

}());