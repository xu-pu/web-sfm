"use strict";

var _ = require('underscore');

var settings = require('../settings.js'),
    ENTRIES = settings.DEMO_ENTRY,
    Project = require('./Project.js');


module.exports = Project.extend({

    // entries in the description

    isDemo: true,

    availableResources: [],

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

    images: null

});