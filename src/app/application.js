'use strict';

var setupControllers = require('./controllers.js'),
    setupRoutes = require('./router.js'),
    setupViews = require('./views.js');

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


setupRoutes(App);
setupControllers(App);
setupViews(App);