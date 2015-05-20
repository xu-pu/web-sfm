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

        var msg = { task: task };

        messages.notify(msg);

        var prom = new Promise(function(resolve, reject){

            var request;

            attempt();

            function attempt(){
                request = new XMLHttpRequest();
                request.open('GET', url);

                request.onload = function(){
                    if (request.status === 200) {
                        complete();
                    }
                    else {
                        failed();
                    }
                };
                request.onerror = failed;
                request.ontimeout = retry;
                request.onabort = failed;
                request.onprogress = progress;

                request.responseType = datatype;
                request.send();
            }

            function complete(){
                terminate();
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
                terminate();
                reject();
            }

            function retry(){
                attempt();
            }

            function terminate(){
                task.set('state', STATES.FINISHED);
                messages.get('queue').removeObject(msg);
            }

        });

        task.set('promise', prom);
        return task;

    }

});