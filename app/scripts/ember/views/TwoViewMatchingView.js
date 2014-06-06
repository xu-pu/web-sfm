'use strict';

App.TwoViewMatchingView = Ember.View.extend({

    tagName: 'div',

    classNames: [
        'floating-window__matching-pair__canvas-container'
    ],

    img1: null,

    img2: null,

    config: null,

//    isReady: function(){}.property(),

    didInsertElement: function(){
//        Ember.Logger.debug(this.get('controller'));
//        Ember.Logger.debug(this.get('controller.model'));
//        Ember.Logger.debug(this.get('controller.view1'));
//        Ember.Logger.debug(this.get('controller.model.view1'));

        Promise.all([
            App.Utils.promiseImage(this.get('controller.view1._id')),
            App.Utils.promiseImage(this.get('controller.view2._id'))
        ]).then(this.renderImagePair.bind(this));

    },

    renderImagePair: function(values){
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
            cam1: { width: img1.width, height: img1.height },
            cam2: { width: img2.width, height: img2.height }
        });
        var canvas = document.createElement('canvas');
        this.get('element').appendChild(canvas);
        canvas.width = fixedWidth;
        canvas.height = alignX ? ratioX*fixedWidth : fixedWidth/ratioY;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img1, 0, 0, img1.width*ratio1, img1.height*ratio1);
        if (alignX) {
            ctx.drawImage(img1, 0, img1.height*ratio1, img2.width*ratio1, img2.height*ratio1);
        }
        else {
            ctx.drawImage(img1, img1.width*ratio1, 0, img2.width*ratio1, img2.height*ratio1);
        }
    },

    renderMatches: function(){}

});