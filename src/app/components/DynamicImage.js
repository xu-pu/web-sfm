'use strict';

module.exports = Ember.Component.extend({

    tagName: 'img',

    classNames: ['dynamic-image'],

    attributeBindings: ['src'],

    src: null, //need

    makeDrag: function(){
        var img = this.get('element'),
            $img = jQuery(img);
        $img.on('load', function(){
            $img.css('width', img.naturalWidth).css('height', img.naturalHeight);
            $img.draggable();
        });
    }.on('didInsertElement'),

    registerWheel: function(){
        var _self = this;
        jQuery(this.get('element')).on('wheel', function(e){
            _self.wheel(e.originalEvent);
        });
    }.on('didInsertElement'),

    wheel: function(e){
        var img = this.get('element'),
            currentWidth = img.width,
            currentHeight = img.height,
            speed = 0.04,
            nextWidth = currentWidth * (e.deltaY < 0 ? 1+speed : 1-speed),
            nextHeight = currentHeight * (e.deltaY < 0 ? 1+speed : 1-speed);
        if (nextWidth > 500 && nextWidth < 5000) {
            jQuery(img).css('width', nextWidth).css('height', nextHeight);
        }
    }

});