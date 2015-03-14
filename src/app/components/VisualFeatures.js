"use strict";

var ndarray = require('ndarray');

var drawFeatures = require('../../visualization/features.js');

module.exports = Ember.Component.extend({

    img: null, // need

    features: null, // need

    tagName: 'canvas',

    classNames: ['visual-features'],

    onNewImage: function(){
        this.renderCanvas();
        var img = this.get('element'),
            $img = jQuery(img);
        $img.css('width', img.width).css('height', img.height);
    }.observes('img').on('didInsertElement'),

    renderCanvas: function(){
        var img = this.get('img'),
            width = img.width,
            height = img.height,
            canvas = this.get('element'),
            markSize = Math.max(3, Math.round(Math.max(width,height)/400)),
            typed = new Float32Array(this.get('features')),
            amount = typed.length/ 4,
            ndbuffer = ndarray(typed, [amount, 4]);
        canvas.width = width;
        canvas.height = height;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        drawFeatures.fromBuffer(ctx, ndbuffer, 0, 0, 1, { markSize: markSize });
    },

    makeDrag: function(){
        this.$().draggable();
    }.on('didInsertElement'),

    registerWheel: function(){
        var _self = this;
        jQuery(this.get('element')).on('wheel', function(e){
            _self.wheel(e.originalEvent);
        });
    }.on('didInsertElement'),

    wheel: function(e){
        var canvas = this.get('element'),
            currentWidth = this.$().width(),
            currentHeight = this.$().height(),
            speed = 0.04,
            nextWidth = currentWidth * (e.deltaY < 0 ? 1+speed : 1-speed),
            nextHeight = currentHeight * (e.deltaY < 0 ? 1+speed : 1-speed);
        if (nextWidth >= canvas.width) {
            jQuery(canvas).css('width', canvas.width).css('height', canvas.height);
        }
        else if (nextWidth > 500) {
            jQuery(canvas).css('width', nextWidth).css('height', nextHeight);
        }
    }

});