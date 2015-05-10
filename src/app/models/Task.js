'use strict';

var STATES = require('../settings.js').TASK_STATES;

module.exports = Ember.Object.extend({

    state: STATES.UNASSIGNED,

    desc: 'task',

    data: null,

    type: null,

    promise: null,

    progress: null,

    isDone: function(){
        return this.get('state') === STATES.FINISHED;
    }.property('state')

});