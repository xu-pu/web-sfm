'use strict';

module.exports = Ember.View.extend({

    tagName: 'div',

    templateName: 'widgets/project-thumbnail',

    classNames: [
        'welcome-screen__projects__thumbnail'
    ],

    actions: {

        'delete': function(){
            this.set('isConfirmDelete', false);
            this.promiseDelete();
        },

        confirmDelete: function(){
            this.toggleProperty('isConfirmDelete');
        },

        cancelDelete: function(){
            this.set('isConfirmDelete', false);
        }

    }
    
});