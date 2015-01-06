"use strict";

var _ = require('underscore');

var settings = require('../settings.js'),
    ENTRIES = settings.DEMO_ENTRY,
    Project = require('./Project.js');


module.exports = Project.extend({

    // entries in the description

    root: null,

    entries: [],

    hasFeature: function(){
        return this.get('entries').contains(ENTRIES.FEATURE);
    }.property('entries'),

    hasMatch: function(){
        return this.get('entries').contains(ENTRIES.MATCH);
    }.property('entries'),

    hasCalibration: function(){
        return this.get('entries').contains(ENTRIES.CALIBRATION);
    }.property('entries'),

    hasMVS: function(){
        return this.get('entries').contains(ENTRIES.MVS);
    }.property('entries'),

    images: null,


    // Selection

    selectedEntries: [],

    selectedImage: function(){
        return this.get('selectedEntries').contains(ENTRIES.IMAGE);
    }.property('selectedEntries.length'),

    selectedFeature: function(){
        return this.get('selectedEntries').contains(ENTRIES.FEATURE);
    }.property('selectedEntries.length'),

    selectedMatch: function(){
        return this.get('selectedEntries').contains(ENTRIES.MATCH);
    }.property('selectedEntries.length'),

    selectedCalibration: function(){
        return this.get('selectedEntries').contains(ENTRIES.CALIBRATION);
    }.property('selectedEntries.length'),

    selectedMVS: function(){
        return this.get('selectedEntries').contains(ENTRIES.MVS);
    }.property('selectedEntries.length'),

    // Loaded

    loadedEntries: [],

    calibrationLoaded: function(){
        return this.get('loadedEntries').contains(ENTRIES.CALIBRATION);
    }.property('loadedEntries.length'),

    mvsLoaded: function(){
        return this.get('loadedEntries').contains(ENTRIES.MVS);
    }.property('loadedEntries.length'),

    loadedImages: [],

    loadedFeatures: [],

    imagesFinished: function(){
        return this.get('loadedImages.length') === this.get('images.length');
    }.property('loadedImages.length'),

    featuresFinished: function(){
        return this.get('loadedFeatures.length') === this.get('images.length');
    }.property('loadedFeatures.length'),

    updateLoadedEntries: function(){

        var loaded = this.get('loadedEntries');

        if (this.get('imagesFinished')) {
            loaded.addObject(ENTRIES.IMAGE);
        }
        else {
            loaded.removeObject(ENTRIES.IMAGE);
        }

        if (this.get('featuresFinished')) {
            loaded.addObject(ENTRIES.FEATURE);
        }
        else {
            loaded.removeObject(ENTRIES.FEATURE);
        }

    }.observes('imagesFinished', 'featuresFinished'),


    isReady: function(){
        var _self = this;
        return this.get('selectedEntries').every(function(entry){
            switch (entry) {
                case ENTRIES.IMAGE:
                    return _self.get('imagesFinished');
                case ENTRIES.FEATURE:
                    return _self.get('featuresFinished');
                case ENTRIES.MATCH:
                    return _self.get('matchLoaded');
                case ENTRIES.CALIBRATION:
                    return _self.get('calibrationLoaded');
                case ENTRIES.MVS:
                    return _self.get('mvsLoaded');
                default:
                    throw 'Invalid Entry';
            }
        });
    }.property('selectedEntries.length', 'loadedEntries.length', 'imagesFinished', 'featuresFinished'),


    // config of Demo Class

    storedProperties: [

        'name',
        'root',
        'images',
        'entries',

        'selectedEntries',
        'loadedEntries',

        'loadedImages',
        'loadedFeatures'

    ]


});