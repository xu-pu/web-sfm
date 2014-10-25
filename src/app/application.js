'use strict';

var setupControllers = require('./controllers.js'),
    setupRoutes = require('./router.js'),
    setupViews = require('./views.js');

window.Promise = Promise || Ember.RSVP.Promise;
jQuery.event.props.push( "dataTransfer" );

var App = window.App = Ember.Application.create({
    LOG_TRANSITIONS: true
});

setupRoutes(App);
setupControllers(App);
setupViews(App);