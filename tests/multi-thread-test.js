'use strict';

$(function(){

    var dataset = [
        ['00000034', '00000035'],
        ['00000034', '00000036'],
        ['00000034', '00000037'],
        ['00000034', '00000038'],
        ['00000034', '00000040']
    ];


    var cached = [],
        uncached = [];

    dataset.forEach(function(pair, index){
        var key = parseInt(pair[0]) + '&' + parseInt(pair[1]);
        var value = getLocalStorage(key);
        if (value) {
            cached.push({ cam1: parseInt(pair[0]), cam2: parseInt(pair[1]), matches: value });
        }
        else {
            uncached.push(index);
        }
    });

    uncached = _.map(uncached, function(index){
        return dataset[index];
    });

    schedule(SFM.TASK_MATCHING, new TwoViewIterator(uncached), function(calculated){
        var results = _.map(uncached, function(pair, index){
            var key = parseInt(pair[0]) + '&' + parseInt(pair[1]);
            setLocalStorage(key, calculated[index]);
            return {
                cam1: parseInt(pair[0]),
                cam2: parseInt(pair[1]),
                matches: calculated[index]
            };
        });
        results = results.concat(cached);
        var tracks = SFM.tracking(results);
        console.log(tracks);
    });

});


function TwoViewIterator(pairs){

    var current = 0;

    this.ended = pairs.length === 0;

    this.next = function(callback){
        if (!this.ended) {
            var dataIndex = current;
            getTwoViewPair(pairs[current][0], pairs[current][1], function(img1, img2, features1, features2){
                var cam1 = { width: img1.width, height: img1.height },
                    cam2 = { width: img2.width, height: img2.height };

                callback(dataIndex, { cam1: cam1, cam2: cam2, features1: features1, features2: features2 });
            });
            current++;
            this.ended = current === pairs.length;
        }
        else {
            throw 'iteration ended';
        }
    };
}

function WorkerThread(){
    this.worker = null;
    this.busy = false;
    this.metadata = null;
    this.callback = null;
}

WorkerThread.prototype = {

    start: function(){
        this.worker = new Worker(SFM.WORKER);
        this.worker.onmessage = this.respond.bind(this);
    },

    stop: function(){
        this.worker.terminate();
    },

    assign: function(task, data, metadata, callback){
        this.metadata = metadata;
        this.callback = callback;
        this.busy = true;
        this.worker.postMessage({
            task: task,
            data: data
        });
        console.log('job assigned');
    },

    respond: function(e){
        console.log('job returned');
        this.busy = false;
        var callback = this.callback;
        var metadata = this.metadata;
        this.callback = null;
        this.metadata = null;
        callback(metadata, this, e.data);
    }

};


function schedule(task, dataIter, callback){
    var POOL_SIZE = 4;
    var threadPool = [];
    var results = [];

    initialize();

    function initialize(){
        if (dataIter.ended) {
            callback([]);
        }
        var thread;
        while (threadPool.length < POOL_SIZE && !dataIter.ended) {
            thread = new WorkerThread();
            threadPool.push(thread);
            thread.start();
            dataIter.next(function(dataIndex, data){
                this.assign(task, data, dataIndex, oneDone);
            }.bind(thread));
        }
    }

    function oneDone(dataIndex, thread, result){
        var finished = threadPool.every(function(t){ return !t.busy });
        results[dataIndex] = result;
        if (!dataIter.ended) {
            dataIter.next(function(i, data){
                thread.assign(task, data, i, oneDone);
            });
        }
        else {
            thread.stop();
            if (finished){
                callback(results);
                console.log(results);
            }
        }
    }

}
