"use strict";

var STORES = require('../settings.js').STORES,
    sfmstore = require('../store/sfmstore.js');

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
    }.property('width', 'height'),

    fullimage: function(){
        var _self = this;
        return sfmstore
            .promiseAdapter()
            .then(function(adapter){
                return adapter.promiseData(STORES.FULLIMAGES, _self.get('_id'));
            });
    }.property('_id'),

    init: function(){
        if (!this.get('thumbnail')){
            this.promiseThumbnail();
        }
    },

    promiseThumbnail: function(){
        var _self = this;
        return sfmstore
            .promiseAdapter()
            .then(function(adapter){
                return adapter.promiseData(STORES.THUMBNAILS, _self.get('_id'));
            })
            .then(function(thumbnail){
                _self.set('thumbnail', thumbnail);
            });
    }

});

