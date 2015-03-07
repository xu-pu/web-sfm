'use strict';

var setupControllers = require('./controllers.js'),
    setupRoutes = require('./router.js');

window.Promise = Promise || Ember.RSVP.Promise;
jQuery.event.props.push( "dataTransfer" );

var App = window.App = Ember.Application.create({
    LOG_TRANSITIONS: true
});


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


//============================================
// Views
//============================================


App.CpuSettingView = require('./views/CpuSettingView.js');
App.SiftView = require('./views/SiftView.js');


setupRoutes(App);
setupControllers(App);