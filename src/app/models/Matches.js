'use strict';

var sfmstore = require('../store/sfmstore.js'),
    STORES = require('../settings.js').STORES;


module.exports = Ember.Object.extend({

    images: null,

    finished: [],

    scheduler: null,

    getQueueIterator: function(){
        var finished = this.get('finished'),
            images = this.get('images'),
            ended = false,
            bound = images.length,
            offset1 = 0,
            offset2 = 0;

        findNext();

        function isEnded(){
            return ended;
        }

        function getKey(i1, i2){
            var id1 = images[i1].get('_id');
            var id2 = images[i2].get('_id');
            if (id1>id2) {
                return id2+'&'+id1;
            }
            else if (id1<id2) {
                return id1+'&'+id2;
            }
            else {
                throw 'same image can not match';
            }
        }

        function findNext(){
            var found = false;
            while (!ended && !found) {
                if (offset2 < bound-1) {
                    offset2++;
                }
                else {
                    if (offset1 < bound-2) {
                        offset1++;
                        offset2 = offset1 + 1;
                    }
                    else {
                        ended = true;
                        break;
                    }
                }
                if (finished.indexOf(getKey(offset1, offset2)) === -1) {
                    found = true;
                }
            }
        }

        function next(callback){
            var key = getKey(offset1, offset2);
            sfmstore
                .promiseAdapter()
                .then(function(adapter){
                    return Promise.all([
                        adapter.promiseData(STORES.FEATURES, images[offset1].get('_id')),
                        adapter.promiseData(STORES.FEATURES, images[offset2].get('_id')),
                        adapter.promiseData(STORES.IMAGES, images[offset1].get('_id')),
                        adapter.promiseData(STORES.IMAGES, images[offset2].get('_id'))
                    ])
                })
                .then(function(values){
                    callback({
                        key: key,
                        features1: values[0],
                        features2: values[1],
                        cam1: { width: values[2].width, height: values[2].height },
                        cam2: { width: values[3].width, height: values[3].height }
                    }, key);
                });
            findNext();
        }

        return {
            isEnded: isEnded,
            next: next
        }
    },

    scheduleMatching: function(callback){
        if (this.get('scheduler') === null) {
            sfmstore
                .promiseProject()
                .then(function(projectModel){
                    var iterator = this.getQueueIterator();
                    var scheduler = App.schedule(projectModel, SFM.TASK_MATCHING, iterator, this.get('finished'), callback);
                    this.set('scheduler', scheduler);
                }.bind(this));
        }
    }

});