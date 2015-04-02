'use strict';

var DragZoomMixin = require('../mixins/DragZoom.js');

module.exports = Ember.Component.extend(DragZoomMixin, {

    tagName: 'img',

    classNames: ['dynamic-image'],

    attributeBindings: ['src'],

    src: null, //need

    wheel: function(e){
        var img = this.get('element'),
            currentWidth = img.width,
            currentHeight = img.height,
            speed = 0.04,
            nextWidth = currentWidth * (e.deltaY < 0 ? 1+speed : 1-speed),
            nextHeight = currentHeight * (e.deltaY < 0 ? 1+speed : 1-speed);
        if (nextWidth >= img.naturalWidth) {
            jQuery(img).css('width', img.naturalWidth).css('height', img.naturalHeight);
        }
        else if (nextWidth > 500) {
            jQuery(img).css('width', nextWidth).css('height', nextHeight);
        }
    }

});