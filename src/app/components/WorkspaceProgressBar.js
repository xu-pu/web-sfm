'use strict';

var STAGES = require('../settings.js').STAGES;

module.exports = Ember.Component.extend({

    workspace: null, //need

    expand: false,

    actions: {
        toggleExpand: function(){
            this.toggleProperty('expand');
        }
    },

    description: function(){
        switch (this.get('workspace.stage')) {
            case STAGES.BEFORE:
                return 'Sturcture from Motion';
            case STAGES.EXTRACTOR:
                return 'extracting SIFT features';
            case STAGES.MATCHING:
                return 'matching features between two-views';
            case STAGES.TRACKING:
                return 'tracking consistent tracks from matches';
            case STAGES.REGISTER:
                return 'Calibrating Cameras';
            default:
                throw 'invalid application stage';
        }
    }.property('workspace.stage')

});