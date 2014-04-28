'use strict';

App.Router.map(function() {

    this.resource('input', function(){
        this.route('index');
//        this.resource('images', { path: '/images/:id' });
    });

    this.resource('stereo', function(){
        this.route('index');
    });

});


App.InputRoute = Ember.Route.extend({

    model: function() {
        if (App.Data.images === null){
            return new Ember.RSVP.Promise(function(resolve){
                var images = App.Data.images = Ember.A();
                IDBAdapter.queryEach('images',
                    function(key, value){
                        value._id = key;
                        images.addObject(App.Image.create(value));
                    },
                    function(){
                        resolve(images);
                    }
                );
            });
        }
        else {
            return App.Data.images;
        }
    }

});

App.InputIndexRoute = Ember.Route.extend();
App.InputImagesRoute = Ember.Route.extend();
App.StereoRoute = Ember.Route.extend();
App.StereoIndexRoute = Ember.Route.extend();