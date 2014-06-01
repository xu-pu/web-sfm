'use strict';

App.Matches = Ember.Object.extend({

    images: null,

    finished: null,

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
//            console.log(offset1+'&'+offset2);
            var key = getKey(offset1, offset2);
            /*
                        Promise.all([
                            IDBAdapter.promiseData(SFM.STORE_FEATURES, images[offset1].get('_id')),
                            IDBAdapter.promiseData(SFM.STORE_FEATURES, images[offset2].get('_id'))
                        ]).then(function(values){
         callback({ key: key, features1: values[0], features2: values[1] });
                        });
        */
            callback({ key: key });
            findNext();
        }

        return {
            isEnded: isEnded,
            next: next
        }
    },

    scheduleMatching: function(progress, callback){
        App.SfmLogic.promiseProject().then(function(projectModel){
            var iterator = this.getQueueIterator();
            var scheduler = App.schedule(projectModel, SFM.TASK_MATCHING, iterator, progress, callback);
            this.set('scheduler', scheduler);
        }.bind(this));
    }

});