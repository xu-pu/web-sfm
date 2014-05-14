'use strict';

App.Router.map(function() {

    this.resource('input', function(){
        this.route('index', { path: '/'});
        this.resource('images', { path: '/images/:id' });
    });

    this.resource('extractor', function(){
        this.route('index', { path: '/' });
        this.route('image', { path: '/:image' });
    });

    this.resource('register', function(){
        this.route('index');
        this.route('tracking');
        this.resource('registration', function(){
            this.route('index', { path: '/' });
            this.route('cameras', { path: '/:camera' });
        });
    });

    this.resource('stereo', function(){
        this.route('index');
    });

});


App.InputRoute = Ember.Route.extend({

    model: function() {
        return App.Data.promiseImages();
    }

});

App.InputIndexRoute = Ember.Route.extend();

App.ImagesRoute = Ember.Route.extend({

    model: function(params){
        return this.modelFor('input').findBy('_id', parseInt(params.id));
    },

    serialize: function(model){
        return { id: model.get('_id') };
    }

});

App.ExtractorRoute = Ember.Route.extend();
App.ExtractorIndexRoute = Ember.Route.extend();
App.ExtractorImageRoute = Ember.Route.extend();

App.RegisterRoute = Ember.Route.extend();
App.RegisterIndexRoute = Ember.Route.extend();

App.RegistrationRoute = Ember.Route.extend();
App.RegistrationIndexRoute = Ember.Route.extend();
App.RegistrationCamerasRoute = Ember.Route.extend();

App.StereoRoute = Ember.Route.extend();
App.StereoIndexRoute = Ember.Route.extend();
