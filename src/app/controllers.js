'use strict';

module.exports = function(App){


    //=======================
    // SFM Controllers
    //=======================

    App.DownloadSchedulerController = require('./SfmControllers/DownloadSchedulerController.js');
    App.DemoDownloaderController = require('./SfmControllers/DemoDownloaderController.js');
    App.SfmStoreController = require('./SfmControllers/SfmStoreController.js');

    //=======================
    // Welcome Screen
    //=======================

    App.WelcomeController = require('./controllers/WelcomeController.js');

    App.WelcomeDemoController = Ember.ObjectController.extend();

    App.DemosController = Ember.ArrayController.extend({
        itemController: 'demo'
    });

    App.DemoController = require('./controllers/DemoController.js');

    App.ProjectsController = require('./controllers/ProjectsController.js');

    App.ProjectThumbnailController = require('./controllers/ProjectThumbnailController.js');

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