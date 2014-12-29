'use strict';

var Worker = require('../models/Worker.js'),
    STATES = require('../settings.js').STATES,
    TASK_STATE = require('../settings.js').TASK_STATES;

/**
 * The WorkerScheduler maintains:
 * 1. Worker Pool
 * 2. Task Queue
 * Application set its [poolSize] to change its size, [#promiseTask] to assign task,
 * [#suspend] and [#resume] to control execution
 */
module.exports = Ember.ArrayController.extend({

    itemController: 'worker',

    queue: [],

    state: STATES.STOPPED,

    poolSize: 4,


    /**
     * Primise the worker script is loaded
     * @returns {Promise}
     */
    promiseReady: function(){},


    /**
     * Promise to finish a task
     * @param {Task} task
     * @returns {Promise}
     */
    promiseTask: function(task){},


    suspend: function(){

    },

    resume: function(){

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