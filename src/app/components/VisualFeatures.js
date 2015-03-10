"use strict";

var drawFeatures = require('../../visualization/drawFeatures.js');

module.exports = Ember.Component.extend({

    img: null, // need

    features: null, // need

    tagName: 'canvas',

    onNewImage: function(){
        this.renderCanvas();
    }.observes('img').on('didInsertElement'),

    renderCanvas: function(){
        var img = this.get('img'),
            fixedWidth = this.$().width(),
            ratio = fixedWidth/img.width,
            height = img.height*ratio,
            canvas = this.get('element');
        canvas.width = fixedWidth;
        canvas.height = height;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, fixedWidth, height);
        drawFeatures(ctx, this.get('features'), 0, 0, ratio);
    }

});