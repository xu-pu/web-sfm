var STATES = require('./settings.js').STATES;

module.exports = function(App){

    App.ApplicationController = Ember.ObjectController.extend();

    //=======================
    // Welcome Screen
    //=======================

    App.WelcomeController = Ember.ObjectController.extend();

    App.DemosController = Ember.ArrayController.extend({
        itemController: 'demo'
    });

    App.ProjectsController = Ember.ArrayController.extend({
        itemController: 'project.thumbnail'
    });

    App.DemoController = require('./controllers/DemoController.js');

    App.ProjectThumbnailController = Ember.ObjectController.extend();


    //=======================
    // Workspace
    //=======================

    App.WorkspaceController = require('./controllers/WorkspaceController.js');

    //App.ProjectController = require('./controllers/ProjectController.js');

    App.WorkspaceImagesController = Ember.ArrayController.extend({
        itemController: 'workspace.image.thumbnail'
    });

    App.WorkspaceImageThumbnailController = Ember.ObjectController.extend({
        actions: {
            expand: function(){
                this.transitionToRoute('workspace.images.detail', this.get('model'));
            }
        }
    });

    App.WorkspaceImagesDetailController = Ember.ObjectController.extend();

    App.ExtractorController = Ember.ArrayController.extend({
        itemController: 'extractor.thumbnail'
    });

    App.ExtractorThumbnailController = Ember.ObjectController.extend({
        actions: {
            expand: function(){
                this.transitionToRoute('extractor.image', this.get('model'));
            }
        }
    });

    App.MatchesController = Ember.ObjectController.extend();

    App.MatchesPairController = Ember.ObjectController.extend({
        needs: ['matches']
    });

    App.TracksController = Ember.ObjectController.extend();

};