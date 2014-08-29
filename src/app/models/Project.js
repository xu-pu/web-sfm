"use strict";

/**
 * It is different from DemoProject, the Project object contains the state of SFM
 */
module.exports = Ember.Object.extend({

    siftFinished: false,
    bundlerFinished: false,
    mvsFinished: false,

    isFinished: function(){
        return this.get('siftFinished') &&
            this.get('bundlerFinished') &&
            this.get('mvsFinished');
    }.property('siftFinished','bundlerFinished','mvsFinished')

});