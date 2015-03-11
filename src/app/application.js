'use strict';

var setupControllers = require('./controllers.js');

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
App.WorkspaceMatchesIndexRoute = Ember.Route.extend();
App.WorkspaceMatchesPairRoute = require('./routes/WorkspaceMatcherPair.js');
App.WorkspaceRegisterRoute = require('./routes/WorkspaceRegister.js');
App.WorkspaceRegisterIndexRoute = Ember.Route.extend();
App.WorkspaceMvsRoute = require('./routes/WorkspaceMvs.js');
App.WorkspaceMvsIndexRoute = Ember.Route.extend();


//============================================
// Components
//============================================

App.MultiViewStereoComponent = require('./components/MultiViewStereo.js');
App.SparseReconstructionComponent = require('./components/SparseReconstruction.js');
App.ProjectThumbnailComponent = require('./components/ProjectThumbnail.js');
App.ProjectCreatorComponent = require('./components/ProjectCreator.js');
App.WorkspaceProgressBarComponent = require('./components/WorkspaceProgressBar.js');
App.DemoThumbnailComponent = require('./components/DemoThumbnail.js');
App.MatchGridComponent = require('./components/MatchGrid.js');
App.MatchGridNodeComponent = require('./components/MatchGridNode.js');
App.ImageDetailComponent = require('./components/ImageDetail.js');
App.DynamicImageComponent = require('./components/DynamicImage.js');
App.ImageImporterComponent = require('./components/ImageImporter.js');
App.DemoDetailComponent = require('./components/DemoDetail.js');
App.CpuSettingComponent = require('./components/CpuSetting.js');
App.CpuSettingNodeComponent = require('./components/CpuSettingNode.js');
App.WorkspaceControlPanelComponent = require('./components/WorkspaceControlPanel.js');
App.VisualFeaturesComponent = require('./components/VisualFeatures.js');


setupControllers(App);