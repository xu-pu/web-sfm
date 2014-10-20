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

            this.route('extractor', function(){
                this.route('index', { path: '/' });
                this.route('image', { path: '/:id' });
            });

            this.route('register', function(){
                this.route('index', { path: '/' });
            });

            this.route('mvs', function(){
                this.route('index', { path: '/' });
            });

            /*
            this.resource('tracks', function(){
                this.route('index');
            });

            this.resource('matches', function(){
                this.route('index', { path: '/' });
                this.route('pair',  { path: '/:pair' });
            });

 */
        });

    });


    App.ApplicationRoute = Ember.Route.extend({

        model: function(){
            return sfmstore.storePromise;
        }

    });


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

    //=============================
    // Workspace.Images
    //=============================

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


    //=============================
    // Workspace.Images
    //=============================

    App.WorkspaceExtractorRoute = Ember.Route.extend({

        model: function() {
            return this.controllerFor('workspace').promiseImages();
        }

    });

    App.WorkspaceExtractorIndexRoute = Ember.Route.extend();

    App.WorkspaceExtractorImageRoute = Ember.Route.extend({

        model: function(params){
            return this.modelFor('workspace.extractor').findBy('_id', parseInt(params.id));
        },

        serialize: function(model){
            return { id: model.get('_id') };
        }

    });

    //=============================
    // Workspace.Mathces
    //=============================

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

    //=============================
    // Workspace.Register
    //=============================

    App.WorkspaceRegisterRoute = require('./routes/WorkspaceRegisterRoute.js');

    App.WorkspaceRegisterIndexRoute = Ember.Route.extend();

    //=============================
    // Workspace.MVS
    //=============================

    App.WorkspaceMvsRoute = require('./routes/WorkspaceMvsRoute.js');

    App.WorkspaceMvsIndexRoute = Ember.Route.extend();

};