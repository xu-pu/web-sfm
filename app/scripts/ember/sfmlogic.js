'use strict';

App.SfmLogic = (function(){

    var projectModel = null;

    var imageModels = null;

    function initialize(){
        /*
        var appState;
        if (localStorage.getItem()) {
            appState = JSON.parse(localStorage.getItem());
        }
        else {

        }
        */
    }

    function projectHooks(){
        projectModel.addObserver('state', onStateChange);
    }

    function onStateChange(){


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
            if (projectModel) {
                resolve(projectModel);
            }
            else {
                projectModel = App.Project.create({
                    type: SFM.PROJECT_TYPE_TEST,
                    name: 'test'
                });
                projectHooks();
                resolve(projectModel);
            }
        });
    }

    function run(){

    }

    function stop(){
        
    }

    return {
        promiseProject: promiseProject,
        promiseImages: promiseImages
    };

}());