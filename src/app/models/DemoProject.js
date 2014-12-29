"use strict";

var _ = require('underscore');

var Project = require('./Project.js');

module.exports = Project.extend({

    // entries in the description

    root: null,

    hasFeature: false,

    hasMatch: false,

    hasCalibration: false,

    hasMVS: false,

    images: null,


    // Demo state

    finishedImages: [],

    imagesFinished: function(){
        return this.get('finishedImages.length') === this.get('images.length');
    }.property('finishedImages.length'),


    // config of Demo Class

    storedProperties: [
        'name',
        'root',
        'images',

        'hasSIFT',
        'hasBundler',
        'hasMVS',

        'finishedImages',
        'finishedSIFT',
        'bundlerFinished',
        'mvsFinished'
    ]


});