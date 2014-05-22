'use strict';

jQuery.event.props.push( "dataTransfer" );

window.App = Ember.Application.create({
    LOG_TRANSITIONS: true
});

App.Data = {

    images: null,

    promiseImages: function(){
        return new Ember.RSVP.Promise(function(resolve){
            if (App.Data.images){
                resolve(App.Data.images);
            }
            else {
                App.Data.images = Ember.A();
                IDBAdapter.queryEach('images',
                    function(key, value){
                        value._id = key;
                        App.Data.images.addObject(App.Image.create(value));
                    },
                    function(){
                        resolve(App.Data.images);
                    }
                );
            }
        });
    }

};