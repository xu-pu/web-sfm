'use strict';

module.exports = function(App){

    //=======================
    // Resource Controllers
    //=======================

    App.ContextController = require('./ResourceControllers/ContextController.js');

    App.WorkerController = require('./ResourceControllers/WorkerController.js');

    App.SchedulerController = require('./ResourceControllers/SchedulerController.js');

    App.DownloaderController = require('./ResourceControllers/DownloaderController.js');

    App.DemoController = require('./ResourceControllers/DemoController.js');

    App.DemosController = require('./ResourceControllers/DemosController.js');

    App.MatchesController = require('./ResourceControllers/MatchesController.js');

    App.ProjectResourceController = require('./ResourceControllers/ProjectResourceController.js');

    //=======================
    // Welcome Screen
    //=======================

    App.WelcomeController = require('./controllers/WelcomeController.js');

    App.WelcomeDemoController = require('./controllers/WelcomeDemoController.js');


    //=======================
    // Workspace
    //=======================

    App.WorkspaceController = require('./ResourceControllers/WorkspaceController.js');


    //=======================
    // Workspace.Images
    //=======================

    App.WorkspaceImagesController = require('./controllers/WorkspaceImagesController.js');

    App.WorkspaceImagesDetailController = require('./controllers/WorkspaceImagesDetailController.js');


    //=======================
    // Workspace.Extractor
    //=======================

    App.WorkspaceExtractorController = Ember.ArrayController.extend({

        images: Ember.computed.alias('model'),

        actions: {
            expand: function(model){
                this.transitionToRoute('workspace.extractor.image', model);
            }
        }

    });

    App.WorkspaceExtractorImageController = require('./controllers/WorkspaceExtractorImageController.js');


    //=======================
    // Workspace.Matches
    //=======================

    App.WorkspaceMatcherController = Ember.ObjectController.extend({

        needs: ['workspace', 'matches'],

        images: Ember.computed.alias('model.images'),

        matches: Ember.computed.alias('controllers.matches')

    });

    App.WorkspaceMatcherPairController = Ember.ObjectController.extend({

        needs: ['matches'],

        queryParams: ['from', 'to']

    });

    App.TracksController = Ember.ObjectController.extend();

    //=======================
    // Workspace.Register
    //=======================

    App.WorkspaceRegisterController = Ember.Controller.extend({

        focus: null,

        actions: {
            focus: function(cam){
                this.set('focus', cam);
            }
        }

    });

    //=======================
    // Workspace.Stereo
    //=======================

    App.WorkspaceMvsController = Ember.Controller.extend();

};