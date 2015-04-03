'use strict';

var GRID_SIZE_MAX = 2500,
    GRID_SIZE_MIN = 500;

module.exports = Ember.Component.extend({

    tagName: 'div',

    classNames: ['main-container__match-grid'],

    hover: null,

    mouseLeave: function(){
        this.set('hover', null);
    },

    registerWheel: function(){
        var _self = this;
        jQuery(this.get('element')).on('wheel', function(e){
            _self.wheel(e.originalEvent);
        });
    }.on('didInsertElement'),

    wheel: function(e){
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