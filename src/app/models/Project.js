"use strict";

var STAGES = require('../settings.js').STAGES;

/**
 * It is different from DemoProject, the Project object contains the state of SFM
 */
module.exports = Ember.Object.extend({

    name: null,
    images: null,

    finishedSIFT: [],
    siftFinished: function(){
        return this.get('images.length') === this.get('finishedSIFT.length');
    }.property('images.length', 'finishedSIFT.length'),

    bundlerFinished: false,
    mvsFinished: false,

    isFinished: function(){
        return this.get('siftFinished') &&
            this.get('bundlerFinished') &&
            this.get('mvsFinished');
    }.property('siftFinished','bundlerFinished','mvsFinished'),

    stage: STAGES.BEFORE

});