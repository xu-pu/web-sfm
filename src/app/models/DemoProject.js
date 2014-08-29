"use strict";

var Project = require('./Project.js');

module.exports = Project.extend({

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
    }.property('imagesFinished', 'siftFinished','bundlerFinished','mvsFinished', 'hasSIFT','hasBundler','hasMVS')

});