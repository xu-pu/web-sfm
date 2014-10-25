'use strict';

var _ = require('underscore');

var STATES = {
    QUEUE: 0,
    DOWNLOADING: 1,
    FINISHED: 2
};

var TYPES = {
    BLOB: 'blob',
    JSON: 'json'
};

module.exports = Ember.Object.extend({

    name: null,

    demo: null,

    url: null,

    state: STATES.QUEUE,

    type: null,

    totalSize: null,

    downloadedSize: 0,

    progress: function(){
        var totalSize = this.get('totalSize'),
            downloadedSize = this.get('downloadedSize');
        if (_.isNumber(totalSize)) {
            return Math.floor(100*downloadedSize/totalSize);
        }
        else {
            return 0;
        }
    }.property('downloadedSize')

});

module.exports.TYPES = TYPES;
module.exports.STATES = STATES;