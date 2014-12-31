'use strict';


module.exports = Ember.View.extend({

    tagName: 'div',

    templateName: 'widgets/demo-thumbnail',

    classNameBindings: ['controller.isExpanded'],

    classNames: [
        'welcome-screen__demos__thumbnail'
    ],

    isConfirmDelete: false,

    actions: {

        enter: function(){
            this.get('controllers.sfmStore').set('currentProject', this.get('model'));
            this.transitionToRoute('workspace');
        },

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