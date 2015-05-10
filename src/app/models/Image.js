"use strict";

module.exports = Ember.Object.extend({

    id: null,

    file: null,

    thumbnail: null,

    isReady: true,

    width: null,

    height: null,

    filename: function(){
        return this.get('name') + this.get('extension');
    }.property('name', 'extension'),

    isHorizontal: function(){
        return this.get('width') > this.get('height');
    }.property('width', 'height')

});