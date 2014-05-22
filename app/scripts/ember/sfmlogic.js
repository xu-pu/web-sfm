'use strict';

App.SfmLogic = (function(){

    var sfmModel = null;

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

    function promiseImages(){
        return new Ember.RSVP.Promise(function(resolve){
            if (imageModels){
                resolve(App.Data.images);
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

    function promiseSfm() {
        return new Ember.RSVP.Promise(function(resolve, reject){
            if (sfmModel) {
                resolve(sfmModel);
            }
            else {
                sfmModel = App.Sfm.create({});
                resolve(sfmModel);
            }
        });
    }

    return {
        promiseSfm: promiseSfm,
        promiseImages: promiseImages
    };

}());