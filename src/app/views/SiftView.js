"use strict";

var drawFeatures = require('../../visualization/drawFeatures.js');

module.exports = Ember.View.extend({

    didInsertElement: function(){
//        console.log(this.get('controller'));
    },

    onNewImage: function(){
        if (!this.get('controller.isLoading')) {
            this.renderCanvas();
        }
    }.observes('controller.isLoading'),

    renderCanvas: function(){
        var img = this.get('controller.img'),
            fixedWidth = this.$().width(),
            ratio = fixedWidth/img.width,
            height = img.height*ratio,
            canvas = this.$('canvas')[0];
        canvas.width = fixedWidth;
        canvas.height = height;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, fixedWidth, height);
        drawFeatures(ctx, this.get('controller.features'), 0, 0, ratio);
    }

});