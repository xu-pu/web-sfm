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


//============================================
// Views
//============================================

App.WelcomeDemoView = require('./RouteViews/WelcomeDemoView.js');
App.WorkspaceMatcherView = require('./RouteViews/WorkspaceMatcherView.js');
App.ProjectThumbnailView = require('./views/ProjectThumbnailView.js');
App.DemoThumbnailView = require('./views/DemoThumbnailView.js');
App.ImageLoaderView = require('./views/ImageLoaderView.js');
App.CpuSettingView = require('./views/CpuSettingView.js');
App.SiftView = require('./views/SiftView.js');
App.StateBarView = require('./views/StateBarView.js');
App.TwoViewMatchingView = require('./views/TwoViewMatchingView.js');
App.ProjectCreatorView = require('./views/ProjectCreatorView.js');


setupRoutes(App);
setupControllers(App);