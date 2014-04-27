'use strict';

window.App = Ember.Application.create({
    LOG_TRANSITIONS: true
});

App.Router.map(function() {
    this.route('index');
});

App.ApplicationRoute = Ember.Route.extend({


});
