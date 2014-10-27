'use strict';

var Thread = require('../models/Thread.js'),
    STATES = require('../settings.js').STATES,
    TASK_STATE = require('../settings.js').TASK_STATES;

module.exports = Ember.Controller.extend({

    state: STATES.STOPPED,

    poolSize: 4,

    threads: [],

    queue: [],

    inprogress: [],

    suspend: function(){

    },

    resume: function(){

    },

    assign: function(){
        this.get('queue').addObject(task);
    },

    onResize: function(){

    }.observes('poolSize'),

    onStateChange: function(){
        if (this.get('state') === STATES.STOPPED) {
            this.suspend();
        }
        else if (this.get('state') === STATES.RUNNING) {
            this.resume();
        }
    }.observes('state')

});