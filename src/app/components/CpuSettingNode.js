'use strict';

module.exports = Ember.Component.extend({

    index: null, // need
    
    grid: null, // need

    selected: Ember.computed.alias('grid.selected'),

    hoverAt: Ember.computed.alias('grid.hoverAt'),

    classNames: [
        'controll-panel__cpu-setting__node'
    ],

    isEnabled: function(){
        return this.get('index') < this.get('selected');
    }.property('selected'),

    willEnable: function(){
        return (!this.get('isEnabled')) && (this.get('index') <= this.get('hoverAt'));
    }.property('isEnabled', 'hoverAt'),

    willDisable: function(){
        return this.get('isEnabled') && (this.get('index') > this.get('hoverAt'));
    }.property('isEnabled', 'hoverAt'),

    mouseEnter: function(){
        this.set('hoverAt', this.get('index'));
    },

    actions: {

        enable: function(){
            this.set('selected', this.get('index')+1);
        }

    }

});