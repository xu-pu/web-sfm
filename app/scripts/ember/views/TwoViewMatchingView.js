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

//    isReady: function(){}.property(),

    view1: Ember.computed.alias('controller.view1'),

    view2: Ember.computed.alias('controller.view2'),

    modelUpdated: function(){
        Promise.all([
            App.Utils.promiseImage(this.get('view1._id')),
            App.Utils.promiseImage(this.get('view2._id'))
        ]).then(this.renderImagePair.bind(this));
    }.observes('view1', 'view2'),

    didInsertElement: function(){
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
        ctx.drawImage(img1, 0, 0, img1.width*ratio1, img1.height*ratio1);
        if (alignX) {
            ctx.drawImage(img2, 0, img1.height*ratio1+PADDING, img2.width*ratio1, img2.height*ratio1);
        }
        else {
            ctx.drawImage(img2, img1.width*ratio1+PADDING, 0, img2.width*ratio1, img2.height*ratio1);
        }
    },

    renderMatches: function(){}

});