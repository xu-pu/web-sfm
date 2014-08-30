"use strict";

var sfmstore = require('./store/sfmstore.js');

module.exports = function(App){

    App.Router.map(function() {

        this.route('welcome');

        this.route('index', { path: '/'});

        this.route('workspace', function(){

            this.route('index', { path: '/'});

            this.route('images', function(){
                this.route('index', { path: '/'});
                this.route('detail', { path: '/:id' });
            });

            /*
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
 */
        });

    });


    App.ApplicationRoute = Ember.Route.extend();


    App.IndexRoute = Ember.Route.extend({

        model: function(){
            return sfmstore.promiseProject();
        },

        afterModel: function(){
            this.transitionTo('workspace');
        },

        actions: {
            error: function(){
                this.transitionTo('welcome');
            }
        }

    });

    App.WelcomeRoute = require('./routes/WelcomeRoute.js');

    App.WorkspaceRoute = Ember.Route.extend({

        model: function(){
            return sfmstore.promiseProject();
        },

        actions: {

            error: function(error, transition){
                console.log(error);
                console.log('error, back to welcome');
                this.transitionTo('welcome');
            }

        }

    });

    App.WorkspaceIndexRoute = Ember.Route.extend();

    App.WorkspaceImagesRoute = Ember.Route.extend({

        model: function() {
            return this.controllerFor('workspace').promiseImages();
        },

        afterModel: function(model){
            //console.log(model);
        }

    });

    App.WorkspaceImagesIndexRoute = Ember.Route.extend();

    App.WorkspaceImagesDetailRoute = Ember.Route.extend({

        model: function(params){
            return this.modelFor('workspace.images').findBy('_id', parseInt(params.id));
        },

        serialize: function(model){
            return { id: model.get('_id') };
        }

    });

    App.ExtractorRoute = Ember.Route.extend({

        model: function() {
            return this.controllerFor('workspace').get('project').promiseImages();
            //return App.SfmStore.promiseImages();
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
            return this.controllerFor('workspace').get('project').promiseMatches();
            //return App.SfmStore.promiseMatches();
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
            return this.controllerFor('workspace').get('project').promiseTracks();
            //return App.SfmStore.promiseTracks();
        }

    });

    App.RegisterRoute = Ember.Route.extend();

    App.RegisterIndexRoute = Ember.Route.extend();

    App.StereoRoute = Ember.Route.extend();

    App.StereoIndexRoute = Ember.Route.extend();

};