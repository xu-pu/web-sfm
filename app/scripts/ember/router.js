App.Router.map(function() {

    "use strict";

    this.route('projects');

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

    this.resource('tracks', function(){
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
        return App.SfmStore.promiseProject();
    }

});

App.ProjectsRoute = Ember.Route.extend({

    model: function(){
        return App.SfmStore.promiseProjects();
    }

});


App.InputRoute = Ember.Route.extend({

    model: function() {
        return App.SfmStore.promiseImages();
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
        return App.SfmStore.promiseImages();
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
        return App.SfmStore.promiseMatches();
    }

});
App.MatchesIndexRoute = Ember.Route.extend();
App.MatchesPairRoute = Ember.Route.extend({

    model: function(params){
        return new Promise(function(resolve, reject){
            var id1 = parseInt(params.pair.split('&')[0]),
                id2 = parseInt(params.pair.split('&')[1]);
            var bigger = id1<id2 ? id2 : id1,
                smaller = id1<id2 ? id1 : id2;
            App.SfmStore.promiseImages().then(function(images){
                resolve({
                    view1: images.findBy('_id', smaller),
                    view2: images.findBy('_id', bigger)
                });
            }, reject);
        });
    },

    serialize: function(model){
        return { pair: model.view1.get('_id') + '&' + model.view2.get('_id') };
    }

});


App.TracksRoute = Ember.Route.extend({

    model: function(){
        return App.SfmStore.promiseTracks();
    }

});

App.RegisterRoute = Ember.Route.extend();
App.RegisterIndexRoute = Ember.Route.extend();

App.StereoRoute = Ember.Route.extend();
App.StereoIndexRoute = Ember.Route.extend();
