'use strict';

module.exports = Ember.Component.extend({

    images: null, // need

    matches: null, // need

    tagName: 'div',

    classNames: ['match-grid'],

    hover: null,

    mouseLeave: function(){
        this.set('hover', null);
    },
/*
    registerWheel: function(){
        var _self = this;
        jQuery(this.get('element')).on('wheel', function(e){
            _self.wheel(e.originalEvent);
        });
    }.on('didInsertElement'),
*/
    gridsizeInit: function(){
        return 2 * this.get('gridsizeMin');
    }.property('gridsizeMin'),

    gridsizeMax: function(){
        return 100 * this.get('images.length');
    }.property('images.length'),

    gridsizeMin: function(){
        return 40 * this.get('images.length');
    }.property('images.length'),

    wheel: function(e){
        e.preventDefault();
        var GRID_SIZE_MAX = this.get('gridsizeMax'),
            GRID_SIZE_MIN = this.get('gridsizeMin');
        var $grid = jQuery('.match-grid__body'),
            currentSize = $grid.height(),
            speed = 0.02,
            nextSize = currentSize * (e.deltaY < 0 ? 1+speed : 1-speed);
        if (nextSize > GRID_SIZE_MIN && nextSize < GRID_SIZE_MAX) {
            $grid.css('width', nextSize).css('height', nextSize);
        }
    },

    actions: {
        enter: function(param){
            this.sendAction('enter', param);
        }
    }

});