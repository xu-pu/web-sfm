'use strict';

module.exports = Ember.Component.extend({

    grid: null, // need

    matches: null, // need

    hover: Ember.computed.alias('grid.hover'),

    tagName: 'div',

    classNames: ['match-grid__node'],

//    classNameBindings: ['isDiag', 'isTrace', 'isHover', 'isConnected', 'isRobust'],

    classNameBindings: ['isDiag', 'isConnected', 'isRobust'],

    from: null,

    to: null,

    isConnected: function(){
        return this.get('matches').isConnected(this.get('from.id'), this.get('to.id'));
    }.property('matches', 'from', 'to'),

    isRobust: function(){
        return this.get('matches').isRobust(this.get('from.id'), this.get('to.id'));
    }.property('matches', 'from', 'to'),

    isDiag: function(){
        return this.get('from') === this.get('to');
    }.property('from', 'to'),

    click: function(){
        if (this.get('isRobust')) {
            this.sendAction('action', { from: this.get('from.id'), to: this.get('to.id') });
        }
    }

    /*
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

    isFinished: function(){
        return !this.get('isDiag') && this.get('controller.finished').indexOf(this.get('key')) !== -1;
    }.property('controller.matches.length', 'from', 'to'),

    isHover: function(){
        return this === this.get('hover');
    }.property('hover')
*/
});