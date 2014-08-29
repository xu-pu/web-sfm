"use strict";

var Project = require('./Project.js'),
    sfmstore = require('../store/sfmstore.js');

module.exports = Project.extend({

    storedProperties: [
        'name',
        'root',
        'images',

        'hasSIFT',
        'hasBundler',
        'hasMVS',

        'imagesFinished',
        'siftFinished',
        'bundlerFinished',
        'mvsFinished'
    ],

    name: null,
    root: null,
    images: null,

    hasSIFT: false,
    hasBundler: false,
    hasMVS: false,

    isDownloaded: function(){
        return this.get('imagesFinished') &&
            (!this.get('hasSIFT') || this.get('siftFinished')) &&
            (!this.get('hasBundler') || this.get('bundlerFinished')) &&
            (!this.get('hasMVS') || this.get('mvsFinished'));
    }.property('imagesFinished', 'siftFinished','bundlerFinished','mvsFinished', 'hasSIFT','hasBundler','hasMVS'),

    syncLocalStorage: function(){
        sfmstore.syncDemos();
    }.observes('imagesFinished', 'siftFinished','bundlerFinished','mvsFinished')

});