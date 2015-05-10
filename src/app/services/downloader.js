'use strict';

var Task = require('../models/Task.js'),
    settings = require('../settings.js'),
    STATES = settings.TASK_STATES,
    TASK_TYPES = settings.TASKS;


module.exports = Ember.Controller.extend({

    messages: Ember.inject.service(),

    assign: function(url, datatype, desc){

        var messages = this.get('messages');

        var task = Task.create({
            desc: desc,
            data: {
                url: url,
                type: datatype
            },
            type: TASK_TYPES.DOWNLOAD
        });

        messages.notify({
            task: task
        });

        var prom = new Promise(function(resolve, reject){

            var request;

            attempt();

            function attempt(){
                request = new XMLHttpRequest();
                request.open('GET', url);
                request.onload = complete;
                request.onerror = failed;
                request.ontimeout = retry;
                request.onabort = failed;
                request.onprogress = progress;
                request.responseType = datatype;
                request.send();
            }

            function complete(){
                task.set('state', STATES.FINISHED);
                resolve(request.response);
            }

            function progress(evt){
                if (evt.lengthComputable) {
                    task.setProperties({
                        progress: Math.round(100*evt.loaded/evt.total)
                    });
                }
            }

            function failed(){
                task.set('state', STATES.FINISHED);
                reject();
            }

            function retry(){
                attempt();
            }

        });

        task.set('promise', prom);
        return task;

    }

});