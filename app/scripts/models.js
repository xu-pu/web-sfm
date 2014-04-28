"use strict";

App.Image = Ember.Object.extend({

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
        return new Ember.RSVP.Promise(function(resolve, reject){
            IDBAdapter.getData('fullimages', this.get('_id'), resolve);
        });
    }.property('_id'),


    init: function(){
        if (this.get('file')) {
            IDBAdapter.processImageFile(this.get('file')).then(_.bind(this.afterSaved, this));
            Ember.Logger.debug('process begins');
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
        IDBAdapter.getData('thumbnails', this.get('_id')).then(_.bind(function(thumbnail){
            this.set('thumbnail', thumbnail);
            Ember.Logger.debug('thumbnail loaded');
        }, this));
    },

    afterSaved: function(_id){
        Ember.Logger.debug('image stored');
        this.set('_id', _id);
        IDBAdapter.getData('images', _id).then(_.bind(function(img){
            this.set('width', img.width);
            this.set('height', img.height);
            this.set('filename', img.filename);
            this.set('isReady', true);
            this.afterReady();
        }, this));
    }
});