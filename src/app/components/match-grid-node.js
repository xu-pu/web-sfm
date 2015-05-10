'use strict';

module.exports = Ember.Component.extend({

    data: null, // need

    tagName: 'div',

    classNames: 'match-grid__node',

    classNameBindings: ['isDiag', 'isConnected', 'isRobust'],

    from: null,

    to: null,

    isConnected: function(){
        return !!this.get('data');
    }.property('data'),

    isRobust: function(){
        return !!this.get('data.robust');
    }.property('data'),

    isDiag: function(){
        return this.get('from') === this.get('to');
    }.property('from', 'to'),

    click: function(){
        if (this.get('isRobust')) {
            this.sendAction('action', { from: this.get('from'), to: this.get('to') });
        }
    }

});