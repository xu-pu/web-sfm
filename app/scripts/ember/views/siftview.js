'use strict';

App.SiftView = Ember.View.extend({

    loadng: true,

    canvas: null,

    didInsertElement: function(){
        this.controller.addObserver('model', this, 'onNewImage');
        this.onNewImage();
    },

    willDestroyElement: function(){
        this.controller.removeObserver('model', this, 'onNewImage');
    },

    onNewImage: function(){
        this.set('loading', true);
        App.Utils.promiseImage(this.get('controller._id')).then(this.onImageLoaded.bind(this));
    },

    onImageLoaded: function(img){
        var fixedWidth = this.$().width();
        var ratio = fixedWidth/img.width,
            height = img.height*ratio;
        var canvas;

        if (this.get('canvas')){
            canvas = this.get('canvas');
        }
        else {
            canvas = this.$('canvas')[0];
            this.set('canvas', canvas);
        }

        canvas.width = fixedWidth;
        canvas.height = height;

        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, fixedWidth, height);

        IDBAdapter.promiseData(SFM.STORE_FEATURES, this.get('controller._id')).then(function(features){
            Ember.Logger.debug('sift loaded');
            this.drawFeatures(ctx, features, img.height, ratio);
            this.set('loading', false);
        }.bind(this));
    },

    drawFeatures: function(ctx, features, height, scale, options){
        options = options || {};
        _.defaults(options, {
            color: 'red',
            markSize: 3
        });
        ctx.beginPath();
        ctx.strokeStyle = options.color;
        ctx.lineWidth = options.markSize/2;
        _.each(features, function(feature){
            var x = scale*feature.col,
                y = scale*feature.row;
            ctx.moveTo(x-options.markSize, y);
            ctx.lineTo(x+options.markSize, y);
            ctx.moveTo(x, y-options.markSize);
            ctx.lineTo(x, y+options.markSize);
        });
        ctx.stroke();
    }

});