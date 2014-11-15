"use strict";

module.exports = Ember.Object.extend({

    file: null,

    _id: null,

    filename: null,

    thumbnail: null,

    isReady: true,

    width: null,

    height: null,

    isHorizontal: function(){
        return this.get('width') > this.get('height');
    }.property('width', 'height')

});

