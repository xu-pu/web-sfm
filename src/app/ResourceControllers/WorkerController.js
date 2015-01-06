'use strict';

var WORKER_STATE = require('../settings.js').WORKER_STATE;


module.exports = Ember.ObjectController.extend({

    state: WORKER_STATE.IDLE,

    task: null,

    tasks: null

});