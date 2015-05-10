'use strict';

window.Promise = Promise || Ember.RSVP.Promise;
jQuery.event.props.push( "dataTransfer" );

var App = window.App = Ember.Application.create({
    LOG_TRANSITIONS: true
});


//=============================
// Router
//=============================

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

App.ApplicationRoute = Ember.Route.extend();
App.IndexRoute = require('./routes/Index.js');
App.WelcomeRoute = require('./routes/Welcome.js');
App.WelcomeIndexRoute = require('./routes/WelcomeIndex.js');
App.WelcomeDemoRoute = require('./routes/WelcomeDemo.js');
App.WorkspaceRoute = require('./routes/Workspace.js');
App.WorkspaceIndexRoute = Ember.Route.extend();
App.WorkspaceImagesRoute = require('./routes/WorkspaceImages.js');
App.WorkspaceImagesIndexRoute = Ember.Route.extend();
App.WorkspaceImagesDetailRoute = require('./routes/WorkspaceImagesDetail.js');
App.WorkspaceExtractorRoute = require('./routes/WorkspaceExtractor.js');
App.WorkspaceExtractorIndexRoute = Ember.Route.extend();
App.WorkspaceExtractorImageRoute = require('./routes/WorkspaceExtractorImage.js');
App.WorkspaceMatcherRoute = require('./routes/WorkspaceMatcher.js');
App.WorkspaceMatcherIndexRoute = Ember.Route.extend();
App.WorkspaceMatcherPairRoute = require('./routes/WorkspaceMatcherPair.js');
App.WorkspaceRegisterRoute = require('./routes/WorkspaceRegister.js');
App.WorkspaceRegisterIndexRoute = Ember.Route.extend();
App.WorkspaceMvsRoute = require('./routes/WorkspaceMvs.js');
App.WorkspaceMvsIndexRoute = Ember.Route.extend();


//============================================
// Components
//============================================

App.MultiViewStereoComponent = require('./components/multi-view-stereo.js');
App.SparseReconstructionComponent = require('./components/sparse-reconstruction.js');
App.ProjectThumbnailComponent = require('./components/project-thumbnail.js');
App.ProjectCreatorComponent = require('./components/project-creator.js');
App.WorkspaceProgressBarComponent = require('./components/workspace-progress-bar.js');
App.DemoThumbnailComponent = require('./components/demo-thumbnail.js');
App.MatchGridComponent = require('./components/match-grid.js');
App.MatchGridNodeComponent = require('./components/match-grid-node.js');
App.ImageDetailComponent = require('./components/image-detail.js');
App.DynamicImageComponent = require('./components/dynamic-image.js');
App.ImageImporterComponent = require('./components/image-importer.js');
App.DemoDetailComponent = require('./components/demo-detail.js');
App.CpuSettingComponent = require('./components/cpu-setting.js');
App.CpuSettingNodeComponent = require('./components/cpu-setting-node.js');
App.WorkspaceControlPanelComponent = require('./components/workspace-control-panel.js');
App.VisualFeaturesComponent = require('./components/visual-features.js');
App.FloatingWindowComponent = require('./components/floating-window.js');
App.VisualMatchingComponent = require('./components/visual-matching.js');
App.MatchModeTabComponent = require('./components/match-mode-tab.js');
App.ImageGalleryComponent = require('./components/image-gallery.js');
App.MessageTrayComponent = require('./components/message-tray.js');
App.BasicMessageComponent = require('./components/basic-message.js');


//=======================
// Services
//=======================

App.MessagesService = require('./services/messgaes.js');

//=======================
// Resource Controllers
//=======================

App.ContextController = require('./ResourceControllers/context.js');
App.SchedulerController = require('./ResourceControllers/scheduler.js');
App.DownloaderController = require('./ResourceControllers/downloader.js');
App.ProjectResourceController = require('./ResourceControllers/project-resource.js');
App.MessageController = require('./ResourceControllers/message.js');

//=======================
// Route Controllers
//=======================

App.WelcomeController = require('./controllers/Welcome.js');
App.WelcomeDemoController = require('./controllers/WelcomeDemo.js');
App.WorkspaceController = require('./ResourceControllers/workspace.js');
App.WorkspaceImagesController = require('./controllers/WorkspaceImages.js');
App.WorkspaceImagesDetailController = require('./controllers/WorkspaceImagesDetail.js');
App.WorkspaceExtractorController = require('./controllers/WorkspaceExtractor.js');
App.WorkspaceExtractorImageController = require('./controllers/WorkspaceExtractorImage.js');
App.WorkspaceMatcherController = require('./controllers/WorkspaceMatcher.js');
App.WorkspaceMatcherPairController = require('./controllers/WorkspaceMatcherPair.js');
App.TracksController = Ember.ObjectController.extend();
App.WorkspaceRegisterController = require('./controllers/WorkspaceRegister.js');
App.WorkspaceMvsController = Ember.Controller.extend();