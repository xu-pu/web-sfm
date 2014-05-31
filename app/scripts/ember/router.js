'use strict';

App.Router.map(function() {

    this.resource('input', function(){
        this.route('index', { path: '/'});
        this.route('image', { path: '/:id' });
    });

    this.resource('extractor', function(){
        this.route('index', { path: '/' });
        this.route('image', { path: '/:id' });
    });

    this.resource('register', function(){
        this.route('index');
    });

    this.resource('matches', function(){
        this.route('index', { path: '/' });
        this.route('pair',  { path: '/:pair' });
    });

    this.resource('stereo', function(){
        this.route('index');
    });

});

App.ApplicationRoute = Ember.Route.extend({

    model: function(){
        return App.SfmLogic.promiseProject();
    }

});


App.InputRoute = Ember.Route.extend({

    model: function() {
        return App.SfmLogic.promiseImages();
    }

});

App.InputIndexRoute = Ember.Route.extend();

App.InputImageRoute = Ember.Route.extend({

    model: function(params){
        return this.modelFor('input').findBy('_id', parseInt(params.id));
    },

    serialize: function(model){
        return { id: model.get('_id') };
    }

});

App.ExtractorRoute = Ember.Route.extend({

    model: function() {
        return App.SfmLogic.promiseImages();
    }

});

App.ExtractorIndexRoute = Ember.Route.extend();
App.ExtractorImageRoute = Ember.Route.extend({

    model: function(params){
        return this.modelFor('extractor').findBy('_id', parseInt(params.id));
    },

    serialize: function(model){
        return { id: model.get('_id') };
    }

});

App.MatchesRoute = Ember.Route.extend({

    model: function(){
        return App.SfmLogic.promiseMatches();
    }

});
App.MatchesIndexRoute = Ember.Route.extend();
App.MatchesPairRoute = Ember.Route.extend({});


App.RegisterRoute = Ember.Route.extend();
App.RegisterIndexRoute = Ember.Route.extend();

//App.RegistrationRoute = Ember.Route.extend();
//App.RegistrationIndexRoute = Ember.Route.extend();
//App.RegistrationCamerasRoute = Ember.Route.extend();

App.StereoRoute = Ember.Route.extend();
App.StereoIndexRoute = Ember.Route.extend();
