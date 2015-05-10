'use strict';

module.exports = Ember.Component.extend({

    workspace: null, // need

    size: Ember.computed.alias('workspace.threadPoolSize'),

    classNames: ['controll-panel__cpu-setting'],

    hoverAt: 4,

    selected: 4,

    onChangeSetting: function(){
        this.set('size', this.get('selected'));
    }.observes('selected')

});