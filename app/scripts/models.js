"use strict";

App.Image = Ember.Object.extend({

    file: null,

    _id: null,

    filename: null,

    isReady: false,

    width: null,

    height: null,

    isHorizontal: function(){
        return this.get('width') > this.get('height');
    }.property('width', 'height'),

    thumbnail: function(){
        return new Ember.RSVP.Promise(function(resolve, reject){
            IDBAdapter.getData('thumbmails', this.get('_id'), resolve);
            Ember.Logger.debug('made a thumnail promise');
        });
    }.property('_id'),

    fullimage: function(){
        return new Ember.RSVP.Promise(function(resolve, reject){
            IDBAdapter.getData('fullimages', this.get('_id'), resolve);
        });
    }.property('_id'),


    init: function(){
        Ember.Logger.debug('image model initialized');
        if (this.get('file')) {
            IDBAdapter.processImageFile(this.get('file'), _.bind(this.afterReady, this));
            Ember.Logger.debug('process begins');
        }
        else if (this.get('_id')){
            this.afterReady(this.get('_id'));
        }
        else {
            throw 'need _id or file to initialze image object';
        }
    },

    afterReady: function(_id){
        Ember.Logger.debug('image stored');
        this.set('_id', _id);
        IDBAdapter.getData('images', _id, _.bind(function(img){
            this.set('width', img.width);
            this.set('height', img.height);
            this.set('filename', img.filename);
            this.set('isReady', true);
            Ember.Logger.debug('image ready');
        }, this));
    }
});
