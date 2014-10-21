var _ = require('underscore');

var Image = require('../models/Image.js');

module.exports = Ember.View.extend({

    isActive: false,

    tagName: 'div',

    classNames: [
        'main-container__input-gallery__item',
        'main-container__input-gallery__input'
    ],

    dragOver: function(e){
        e.preventDefault();
    },

    dragEnter: function(e){
        e.preventDefault();
        this.isActive = true;
    },

    dragLeave: function(e){
        e.preventDefault();
        this.isActive = false;
    },

    drop: function(e){
        e.preventDefault();
        var files = e.dataTransfer.files,
            _self = this;
        _.range(files.length).forEach(function(i){
            _self.get('controller').importImageFile(files[i]);
            //this.modelFor('workspace.images').addObject(Image.create({ file: files[i] }));
        });
    }

});