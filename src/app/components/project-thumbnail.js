'use strict';

module.exports = Ember.Component.extend({

    project: null, // need

    ctx: null, // need

    tagName: 'div',

    classNames: [
        'welcome-screen__projects__thumbnail'
    ],

    isConfirmDelete: false,

    actions: {

        enter: function(){
            this.get('ctx').send('enter', this.get('project'));
        },

        'delete': function(){
            this.set('isConfirmDelete', false);
            this.get('ctx').promiseDeleteProject(this.get('project'));
        },

        confirmDelete: function(){
            this.toggleProperty('isConfirmDelete');
        },

        cancelDelete: function(){
            this.set('isConfirmDelete', false);
        }

    }

});