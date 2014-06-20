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

    metadata: null,

    callback: null,

    calculate: function(task, data, metadata, callback){
        if (this.get('isBusy')) {
            throw 'thread is busy';
        }
        if (this.get('isActive')) {
            this.set('callback', callback);
            this.set('data', data);
            this.set('metadata', metadata);
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
        var metadata = this.get('metadata');
        this.set('callback', null);
        this.set('task', null);
        this.set('data', null);
        this.set('metadata', null);
        callback(e.data, metadata, this);
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
            this.set('callback', null);
            this.set('task', null);
            this.set('data', null);
            this.set('metadata', null);
        }
        else {
            console.log('thread is not started');
        }
    }

});