'use strict';

var STATES = require('../settings.js').TASK_STATES;

module.exports = Ember.Object.extend({

    state: STATES.UNASSIGNED,

    data: null,

    type: null

});