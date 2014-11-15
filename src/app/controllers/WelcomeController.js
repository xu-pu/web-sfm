'use strict';

module.exports = Ember.ObjectController.extend({

    // demos, projects

    needs: ['downloadScheduler'],

    downloading: Ember.computed.alias('controllers.downloadScheduler.downloading'),

    isDetailClosed: true

});