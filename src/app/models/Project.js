"use strict";

var IDBAdapter = require('../store/StorageAdapter.js'),
    Image = require('../models/image.js'),
    utils = require('../utils.js'),
    settings = require('../settings.js'),
    STORES = settings.STORES;

/**
 * It is different from DemoProject, the Project object contains the state of SFM
 */
module.exports = Ember.Object.extend({

    images: null,

    imagesFinished: false,
    siftFinished: false,
    bundlerFinished: false,
    mvsFinished: false,

    isFinished: function(){
        return this.get('imagesFinished') &&
            this.get('siftFinished') &&
            this.get('bundlerFinished') &&
            this.get('mvsFinished');
    }.property('imagesFinished', 'siftFinished','bundlerFinished','mvsFinished')

});