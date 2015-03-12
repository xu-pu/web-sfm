'use strict';

module.exports = Ember.ObjectController.extend({

    needs: ['scheduler', 'context'],

    ctx: Ember.computed.alias('controllers.context'),

    demos: Ember.computed.alias('ctx.demos'),

    projects: Ember.computed.alias('ctx.projects'),

    scheduler: Ember.computed.alias('controllers.scheduler'),

    isDetailClosed: true

});