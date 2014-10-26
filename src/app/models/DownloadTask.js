'use strict';

//var _ = require('underscore');

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

    totalSize: Infinity,

    downloadedSize: 0,

    progress: function(){
        var totalSize = this.get('totalSize'),
            downloadedSize = this.get('downloadedSize');
        return Math.floor(100*downloadedSize/totalSize);
    }.property('downloadedSize'),

    fileSize: function(){
        var totalSize = this.get('totalSize');
        if (totalSize === Infinity) {
            return 'Unknown';
        }
        else {
            return Math.round(totalSize/1024/1024) + 'MB';
        }
    }.property('totalSize')

});

module.exports.TYPES = TYPES;
module.exports.STATES = STATES;