'use strict';

var _ = require('underscore');

var Image = require('../models/Image.js');

module.exports = Ember.Component.extend({

    adapter: null, //need

    images: null, //need

    isActive: false,

    tagName: 'div',

    classNames: [
        'main-container__input-gallery__input'
    ],

    classNameBindings: ['isActive'],

    dragOver: function(e){
        e.preventDefault();
    },

    dragEnter: function(e){
        e.preventDefault();
        this.set('isActive', true);
    },

    dragLeave: function(e){
        e.preventDefault();
        this.set('isActive', false);
    },

    drop: function(e){
        var files = e.dataTransfer.files,
            adapter = this.get('adapter'),
            images = this.get('images');

        e.preventDefault();
        this.set('isActive', false);

        // files is array like, not an array,
        _.range(files.length).forEach(function(i){
            var file = files[i];
            console.log(file);
            adapter
                .processImageFile(file)
                .then(function(data){
                    var image = Image.create(data);
                    images.pushObject(image);
                });
        });
    }

});