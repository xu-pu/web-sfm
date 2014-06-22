App.SfmStore = (function(){

    'use strict';

    var projectModel = null;
    var imageModels = null;
    var matchesModel = null;

    initialize();

    function loadDemoProject(){}


    function initialize(){
        projectModel = App.Project.create({
            type: SFM.PROJECT_TYPE_TEST,
            name: 'test'
        });
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

    function promiseProjects (){
        return new Promise(function(resolve, reject){
            resolve(SFM.DEMO_PROJECTS);
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

    return {
        promiseProjects: promiseProjects,
        promiseProject: promiseProject,
        promiseImages: promiseImages,
        promiseMatches: promiseMatches,
        promiseTracks: promiseTracks
    };

}());