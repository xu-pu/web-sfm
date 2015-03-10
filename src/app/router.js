"use strict";

module.exports = function(App){

    App.Router.map(function() {

        this.route('welcome', function(){
            this.route('demo', { path: '/demo/:name' });
        });

        this.route('workspace', function(){

            this.route('images', function(){
                this.route('detail', { path: '/:id' });
            });

            this.route('extractor', function(){
                this.route('image', { path: '/:id' });
            });

            this.route('matcher', function(){
                this.route('pair');
            });

            this.route('register', function(){});

            this.route('mvs', function(){});

        });

    });


    //=============================
    // Routes
    //=============================

    App.ApplicationRoute = Ember.Route.extend({

        /*
        beforeModel: function(){
            return this.controllerFor('sfmStore').promiseResume();
        }
        */

    });


    App.IndexRoute = Ember.Route.extend({

        model: function(){
            return this.controllerFor('context').promiseProject();
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


    //=============================
    // Welcome
    //=============================

    App.WelcomeRoute = Ember.Route.extend({

        setupController: function(){
            this.controllerFor('context').set('currentProject', null);
        }

    });

    App.WelcomeIndexRoute = Ember.Route.extend({

        setupController: function(){
            this.controllerFor('welcome').set('isDetailClosed', true);
        }

    });

    App.WelcomeDemoRoute = require('./routes/WelcomeDemoRoute.js');

    //=============================
    // Workspace
    //=============================

    App.WorkspaceRoute = require('./routes/WorkspaceRoute.js');

    App.WorkspaceIndexRoute = Ember.Route.extend();

    //=============================
    // Workspace.Images
    //=============================

    App.WorkspaceImagesRoute = Ember.Route.extend({

        model: function() {
            return this.controllerFor('workspace').get('images');
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
            return this.controllerFor('workspace').get('images');
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

    App.WorkspaceMatcherRoute = Ember.Route.extend({

        /**
         * Requires Images and Matches
         * @returns {Promise}
         */
        model: function() {
            var workspace = this.controllerFor('workspace');
            return Promise.all([
                workspace.get('images'),
                workspace.get('matches')
            ]).then(function(results){
                return {
                    images: results[0],
                    matches: results[1]
                };
            });
        }

    });

    App.WorkspaceMatchesIndexRoute = Ember.Route.extend();

    App.WorkspaceMatchesPairRoute = require('./routes/WorkspaceMatcherPairRoute.js');


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