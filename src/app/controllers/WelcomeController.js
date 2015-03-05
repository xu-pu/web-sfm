'use strict';

module.exports = Ember.ObjectController.extend({

    needs: ['scheduler', 'demos', 'context'],

    ctx: Ember.computed.alias('controllers.context'),

    demos: Ember.computed.alias('controllers.demos'),

    projects: Ember.computed.alias('ctx.projects'),

    scheduler: Ember.computed.alias('controllers.scheduler'),

    isDetailClosed: true

});