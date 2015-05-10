'use strict';

module.exports = Ember.Component.extend({

    project: null, // need

    ctx: null, // need

    isExpanded: Ember.computed.alias('project.isExpanded'),

    tagName: 'div',

    classNameBindings: ['isExpanded'],

    classNames: 'welcome-screen__demos__thumbnail',

    isConfirmDelete: false,

    backgroundStyle: function(){
        return 'background-image:url('+ this.get('project.root') +'/thumbnail.jpg)';
    }.property('project.root')

});