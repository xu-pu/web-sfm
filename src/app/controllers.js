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

    App.ProjectController = require('./ResourceControllers/ProjectController.js');

    App.ProjectsController = require('./ResourceControllers/ProjectsController.js');

    App.ImagesController = require('./ResourceControllers/ImagesController.js');


    //=======================
    // Welcome Screen
    //=======================

    App.WelcomeController = require('./controllers/WelcomeController.js');

    App.WelcomeDemoController = require('./controllers/WelcomeDemoController.js');


    //=======================
    // Workspace
    //=======================

    App.WorkspaceController = require('./controllers/WorkspaceController.js');


    //=======================
    // Workspace.Images
    //=======================

    App.WorkspaceImagesController = require('./controllers/WorkspaceImagesController.js');

    App.WorkspaceImageThumbnailController = Ember.ObjectController.extend();

    App.WorkspaceImagesDetailController = require('./controllers/WorkspaceImagesDetailController.js');


    //=======================
    // Workspace.Extractor
    //=======================

    App.WorkspaceExtractorController = Ember.ArrayController.extend({

        itemController: 'workspace.extractor.thumbnail',

        actions: {
            expand: function(model){
                this.transitionToRoute('workspace.extractor.image', model);
            }
        }

    });

    App.WorkspaceExtractorThumbnailController = Ember.ObjectController.extend();

    App.WorkspaceExtractorImageController = require('./controllers/WorkspaceExtractorImageController.js');


    //=======================
    // Workspace.Matches
    //=======================

    App.MatchesController = Ember.ObjectController.extend();

    App.MatchesPairController = Ember.ObjectController.extend({
        needs: ['matches']
    });

    App.TracksController = Ember.ObjectController.extend();

    //=======================
    // Workspace.Register
    //=======================

    App.WorkspaceRegisterController = Ember.ObjectController.extend({

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