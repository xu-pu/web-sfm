'use strict';

App.TwoViewMatchingView = Ember.View.extend({

    tagName: 'div',

    classNames: [
        'floating-window__matching-pair__canvas-container'
    ],

    img1: null,

    img2: null,

    canvas: null,

    config: null,

    view1: Ember.computed.alias('controller.view1'),

    view2: Ember.computed.alias('controller.view2'),

    key: function(){
        return this.get('view1._id') + '&' + this.get('view2._id');
    }.property('view1', 'view2'),

    finished: Ember.computed.alias('controller.controllers.matches.finished'),

    matchesReady: function(){
        return this.get('finished').indexOf(this.get('key')) !== -1;
    }.property('finished', 'key'),

    modelUpdated: function(){
        Promise.all([
            App.Utils.promiseImage(this.get('view1._id')),
            App.Utils.promiseImage(this.get('view2._id'))
        ]).then(this.renderImagePair.bind(this));
    }.observes('view1', 'view2'),

    didInsertElement: function(){
        Ember.Logger.debug(this.get('finished'));
        var canvas = document.createElement('canvas');
        this.get('element').appendChild(canvas);
        this.set('canvas', canvas);
        this.modelUpdated();
    },

    renderImagePair: function(values){
        var PADDING = 10;
        var img1 = values[0],
            img2 = values[1];
        var ratioX = img1.height/img1.width + img2.height/img2.width;
        var ratioY = img1.width/img1.height + img2.width/img2.height;
        var alignX = (ratioX>1 ? ratioX : 1/ratioX) <= (ratioY>1 ? ratioY : 1/ratioY);
        var fixedWidth = this.$().width();
        var ratio1 = alignX ? fixedWidth/img1.width : (fixedWidth/ratioY)/img1.height,
            ratio2 = alignX ? fixedWidth/img2.width : (fixedWidth/ratioY)/img2.height;
        this.set('config', {
            alignX: alignX,
            ratio1: ratio1,
            ratio2: ratio2,
            padding: PADDING,
            cam1: { width: img1.width, height: img1.height },
            cam2: { width: img2.width, height: img2.height }
        });
        var canvas = this.get('canvas');
        canvas.width = fixedWidth;
        canvas.height = alignX ? ratioX*fixedWidth : fixedWidth/ratioY;
        var ctx = canvas.getContext('2d');
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.drawImage(img1, 0, 0, img1.width*ratio1, img1.height*ratio1);
        if (alignX) {
            ctx.drawImage(img2, 0, img1.height*ratio1+PADDING, img2.width*ratio1, img2.height*ratio1);
        }
        else {
            ctx.drawImage(img2, img1.width*ratio1+PADDING, 0, img2.width*ratio1, img2.height*ratio1);
        }
        Ember.Logger.debug(this.get('matchesReady'));
        if (this.get('matchesReady')) {
            this.renderMatches();
        }
    },

    renderMatches: function(){
        var config = this.get('config');
        var ctx = this.get('canvas').getContext('2d');
        Promise.all([
            IDBAdapter.promiseData(SFM.STORE_MATCHES, this.get('key')),
            IDBAdapter.promiseData(SFM.STORE_FEATURES, this.get('view1._id')),
            IDBAdapter.promiseData(SFM.STORE_FEATURES, this.get('view2._id'))
        ]).then(function(values){
            var matches = values[0],
                features1 = values[1],
                features2 = values[2];
            var offsetX, offsetY;
            if (config.alignX) {
                offsetX = 0;
                offsetY = config.cam1.height*config.ratio1 + config.padding;
            }
            else {
                offsetX = config.cam1.width*config.ratio1 + config.padding;
                offsetY = 0;
            }
            App.Utils.drawFeatures(ctx, features1, 0, 0, config.ratio1);
            App.Utils.drawFeatures(ctx, features2, offsetX, offsetY, config.ratio1, { color: 'green' });
            ctx.beginPath();
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 1;
            matches.forEach(function(match){
                var row1 = features1[match[0]].row,
                    col1 = features1[match[0]].col,
                    row2 = features2[match[1]].row,
                    col2 = features2[match[1]].col;
                var x1 = config.ratio1*col1,
                    y1 = config.ratio1*row1,
                    x2 = config.ratio2*col2 + offsetX,
                    y2 = config.ratio2*row2 + offsetY;
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
            });
            ctx.stroke();
        });
    }



});