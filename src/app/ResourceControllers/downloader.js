'use strict';

var settings = require('../settings.js'),
    STATES = settings.TASK_STATES,
    LIMIT = settings.DOWNLOAD_THRESHOLD;


module.exports = Ember.Controller.extend({

    queue: [],

    running: [],

    checkQueue: function(){
        //Ember.run.once(this, 'assign');
    }.observes('queue.length', 'running.length'),

    /**
     * This is immediate, high priority
     */
    assign: function(task){
        var queue = this.get('queue'),
            running = this.get('running');
        queue.removeObject(task);
        running.pushObject(task);
        this.startDownloadTask(task);
    },

    promiseDemoResource: function(demo, name, metadata){},

    startDownloadTask: function(task){

        task.set('state', STATES.RUNNING);

        var _self = this,
            request,
            data = task.get('data');

        attempt();

        function attempt(){
            request = new XMLHttpRequest();
            request.open('GET', data.url);
            request.onload = complete;
            request.onerror = retry;
            request.ontimeout = retry;
            request.onabort = retry;
            request.onprogress = progress;
            request.responseType = data.type;
            request.send();
        }

        function complete(){

            var callback = task.get('callback');

            _self.get('running').removeObject(task);
            task.set('state', STATES.FINISHED);

            callback(request.response);

        }

        function progress(evt){
            /*
             if (evt.lengthComputable) {
             task.setProperties({
             totalSize: evt.total,
             progress: Math.floor(100*evt.loaded/evt.total)
             });
             }
             */
        }

        function retry(){
            attempt();
        }

    }

});