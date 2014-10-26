'use strict';

module.exports = function(App){


    //=======================
    // SFM Controllers
    //=======================

    App.DownloadSchedulerController = require('./SfmControllers/DownloadSchedulerController.js');

    //=======================
    // App Controllers
    //=======================

    App.ApplicationController = Ember.ObjectController.extend();

    //=======================
    // Welcome Screen
    //=======================

    App.WelcomeController = Ember.ObjectController.extend({
        // demos, projects

        needs: ['downloadScheduler'],

        downloading: Ember.computed.alias('controllers.downloadScheduler.downloading')

    });

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

    App.WorkspaceImageThumbnailController = Ember.ObjectController.extend({
        actions: {
            expand: function(){
                this.transitionToRoute('workspace.images.detail', this.get('model'));
            }
        }
    });

    App.WorkspaceImagesDetailController = require('./controllers/WorkspaceImagesDetailController.js');


    //=======================
    // Workspace.Extractor
    //=======================

    App.WorkspaceExtractorController = Ember.ArrayController.extend({
        itemController: 'workspace.extractor.thumbnail'
    });

    App.WorkspaceExtractorThumbnailController = Ember.ObjectController.extend({
        actions: {
            expand: function(){
                this.transitionToRoute('workspace.extractor.image', this.get('model'));
            }
        }
    });

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