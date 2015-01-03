"use strict";

var _ = require('underscore');

var settings = require('../settings.js'),
    ENTRIES = settings.DEMO_ENTRY,
    Project = require('./Project.js');


module.exports = Project.extend({

    // entries in the description

    root: null,

    hasFeature: false,

    hasMatch: false,

    hasCalibration: false,

    hasMVS: false,

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


    //========================================================
    // Selection Toggles
    //========================================================


    toggleImage: function(){
        var selected = this.get('selectedEntries');
        if (this.get('selectedImage')) {
            selected.removeObject(ENTRIES.IMAGE);
        }
        else {
            selected.addObject(ENTRIES.IMAGE);
        }
    },

    toggleFeature: function(){
        if (this.get('hasFeature')) {
            var selected = this.get('selectedEntries');
            if (this.get('selectedFeature')) {
                selected.removeObject(ENTRIES.FEATURE);
            }
            else {
                selected.addObject(ENTRIES.FEATURE);
            }
        }
    },

    toggleMatch: function(){
        if (this.get('hasMatch')) {
            var selected = this.get('selectedEntries');
            if (this.get('selectedMatch')) {
                selected.removeObject(ENTRIES.MATCH);
            }
            else {
                selected.addObject(ENTRIES.MATCH);
            }
        }
    },

    toggleCalibration: function(){
        if (this.get('hasCalibration')) {
            var selected = this.get('selectedEntries');
            if (this.get('selectedCalibration')) {
                selected.removeObject(ENTRIES.CALIBRATION);
            }
            else {
                selected.addObject(ENTRIES.CALIBRATION);
            }
        }
    },

    toggleMVS: function(){
        if (this.get('hasMVS')) {
            var selected = this.get('selectedEntries');
            if (this.get('selectedMVS')) {
                selected.removeObject(ENTRIES.MVS);
            }
            else {
                selected.addObject(ENTRIES.MVS);
            }
        }
    },


    // Loaded

    loadedEntries: [],

    calibrationLoaded: function(){
        return this.get('loadedEntries').contains(ENTRIES.CALIBRATION);
    }.property('loadedEntries'),

    mvsLoaded: function(){
        return this.get('loadedEntries').contains(ENTRIES.MVS);
    }.property('loadedEntries'),

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
            loaded.pushObject(ENTRIES.IMAGE);
        }
        else {
            loaded.removeObject(ENTRIES.IMAGE);
        }

        if (this.get('featuresFinished')) {
            loaded.pushObject();
        }
        else {
            loaded.removeObject(ENTRIES.FEATURE);
        }

    }.observes('imagesFinished', 'featuresFinished'),

    // config of Demo Class

    storedProperties: [

        'name',
        'root',
        'images',

        'hasFeature',
        'hasMatch',
        'hasCalibration',
        'hasMVS',

        'selectedEntries',
        'loadedEntries',

        'loadedImages',
        'loadedFeatures'

    ]


});