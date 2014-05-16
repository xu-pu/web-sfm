'use strict';

App.SiftView = Ember.View.extend({

    didInsertElement: function(){
        var _self = this;
        IDBAdapter.promiseData('fullimages', this.controller.get('_id')).then(function(data){
            var img = document.createElement('img');
            img.onload = function(e){
                _self.onImageLoaded(img);
            };
            img.src = data;
        });
    },

    onImageLoaded: function(img){
        var fixedWidth = this.$().width();
        var ratio = fixedWidth/img.width,
            height = img.height*ratio;
        var canvas = document.createElement('canvas');
        canvas.width = fixedWidth;
        canvas.height = height;
        document.body.appendChild(canvas);
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, fixedWidth, height);
        var container = this.$()[0];
//        container.innerHTML = '';
        container.appendChild(canvas);
//        IDBAdapter.promiseData('features', this.controller.get('_id')).then(_.bind(this, function(features){
//            this.drawFeatures(ctx, features, height, ratio);
//        }));
    },

    drawFeatures: function(ctx, features, height, scale, options){
        options = options || {};
        _.defaults(options, {
            color: 'red',
            markSize: 7
        });

        ctx.beginPath();
        ctx.strokeStyle = options.color;
        ctx.lineWidth = options.markSize/2;
        _.each(features, function(feature){
            var x = scale*feature.col,
                y = scale*(height-1-feature.row);
            ctx.moveTo(x-options.markSize, y);
            ctx.lineTo(x+options.markSize, y);
            ctx.moveTo(x, y-options.markSize);
            ctx.lineTo(x, y+options.markSize);
        });
        ctx.stroke();
    }

});