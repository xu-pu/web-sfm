'use strict';

module.exports = Ember.Component.extend({

    grid: null, // need

    hover: Ember.computed.alias('grid.hover'),

    tagName: 'div',

    classNames: ['match-grid__node'],

    classNameBindings: ['isDiag', 'isTrace', 'isHover'],

    from: null,

    to: null,

    mouseEnter: function(){
        if (this.get('isDiag')) {
            this.get('grid').set('hover', null);
        }
        else {
            this.get('grid').set('hover', this);
        }
    },

    isTrace: function(){
        var hover = this.get('hover');
        if (!!hover && !hover.get('isDiag') && this!=hover) {
            return this.get('from') === hover.get('from') || this.get('to') === hover.get('to');
        }
        else {
            return false;
        }
    }.property('hover'),

    /*
    isFinished: function(){
        return !this.get('isDiag') && this.get('controller.finished').indexOf(this.get('key')) !== -1;
    }.property('controller.matches.length', 'from', 'to'),
*/

    isDiag: function(){
        return this.get('from') === this.get('to');
    }.property('from', 'to'),

    isHover: function(){
        return this === this.get('hover');
    }.property('hover')

});