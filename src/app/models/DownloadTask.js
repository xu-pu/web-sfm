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

    hasProgress: function(){
        return this.get('totalSize') !== Infinity;
    }.property('totalSize'),

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