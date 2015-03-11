'use strict';

var settings = require('../settings.js'),
    ENTRIES = settings.DEMO_ENTRY;

module.exports = Ember.ObjectController.extend({

    needs: ['context'],

    ctx: Ember.computed.alias('controllers.context')

});