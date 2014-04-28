'use strict';

App.Router.map(function() {

    this.resource('input', function(){
        this.route('index', { path: '/'});
        this.resource('images', { path: '/images/:id' });
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

App.StereoRoute = Ember.Route.extend();
App.StereoIndexRoute = Ember.Route.extend();