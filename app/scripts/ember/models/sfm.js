'use strict';

App.Project = Ember.Object.extend({

    threadPoolSize: 4,

    threads: [],

    name: null,

    type: SFM.PROJECT_TYPE_NORMAL,

    stage: SFM.STAGE_BEFORE,

    state: SFM.STATE_STOPPED,

    isRunning: function(){
        return this.get('state') === SFM.STATE_RUNNING;
    }.property('state')

});

App.Thread = Ember.Object.extend({

    worker: null,

    isActive: function(){
        return this.get('worker') ? true : false;
    }.property('worker'),

    isBusy: function(){
        return this.get('task') ? true : false;
    }.property('task'),

    task: null,

    data: null,

    callback: null,

    calculate: function(task, data, callback){
        if (this.get('isBusy')) {
            throw 'thread is busy';
        }
        if (this.get('isActive')) {
            this.set('callback', callback);
            this.set('data', data);
            this.set('task', task);
            this.get('worker').postMessage({
                task: task,
                data: data
            });
        }
        else {
            throw 'try to assign job before thread is created';
        }
    },

    response: function(e){
        var callback = this.get('callback');
        this.set('callback', null);
        this.set('task', null);
        this.set('data', null);
        callback.call(this, e.data);
    },

    start: function(){
        if (this.get('isActive')) {
            console.log('thread is already started');
        }
        else {
            var worker = new Worker('/build/scripts/worker.js');
            worker.onmessage = this.response.bind(this);
            this.set('worker', worker);
        }
    },

    stop: function(){
        if (this.get('isActive')) {
            this.get('worker').terminate();
            this.set('worker', null);
        }
        else {
            console.log('thread is not started');
        }
    }

});