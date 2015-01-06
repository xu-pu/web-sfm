'use strict';

module.exports = Ember.ObjectController.extend({

    needs: ['scheduler', 'demos', 'projects', 'context'],

    demos: Ember.computed.alias('controllers.demos'),

    projects: Ember.computed.alias('controllers.projects'),

    scheduler: Ember.computed.alias('controllers.scheduler'),

    isDetailClosed: true

});