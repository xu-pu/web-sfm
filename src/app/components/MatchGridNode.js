'use strict';

module.exports = Ember.Component.extend({

    table: null, // need

    tagName: 'div',

    classNames: 'match-grid__node',

    classNameBindings: ['isDiag', 'isConnected', 'isRobust'],

    from: null,

    to: null,

    data: function(){
        var table = this.get('table');
        var fromid = this.get('from.id');
        var toid = this.get('to.id');
        return table[fromid][toid];
    }.property('table', 'from', 'to'),

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
            this.sendAction('action', { from: this.get('from.id'), to: this.get('to.id') });
        }
    }

});