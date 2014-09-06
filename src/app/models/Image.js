"use strict";

var STORES = require('../settings.js').STORES,
    sfmstore = require('../store/sfmstore.js');

module.exports = Ember.Object.extend({

    file: null,

    _id: null,

    filename: null,

    thumbnail: null,

    isReady: false,

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
        if (this.get('file')) {
            this.get('adapter')
                .processImageFile(this.get('file'))
                .then(this.afterSaved.bind(this))
                .then(this.afterReady.bind(this));
            Ember.Logger.debug('start processing input image file...');
        }
        else if (this.get('_id')){
            this.set('isReady', true);
            this.afterReady();
        }
        else {
            throw 'need _id or file to initialze image object';
        }
    },

    afterReady: function(){
        var _self = this;
        return sfmstore
            .promiseAdapter()
            .then(function(adapter){
                return adapter.promiseData(STORES.THUMBNAILS, _self.get('_id'));
            })
            .then(function(thumbnail){
                _self.set('thumbnail', thumbnail);
            });
    },

    afterSaved: function(_id){

        Ember.Logger.debug('image stored, _id acquired');
        var _self = this;
        this.set('_id', _id);

        return sfmstore
            .promiseAdapter()
            .then(function(adapter){
                return adapter.promiseData(STORES.IMAGES, _id);
            })
            .then(function(img){
                _self.set('width', img.width);
                _self.set('height', img.height);
                _self.set('filename', img.filename);
                _self.set('isReady', true);
            });
    }

});

