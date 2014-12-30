'use strict';


module.exports = Ember.View.extend({

    tagName: 'div',

    templateName: 'widgets/demo-thumbnail',

    classNameBindings: ['controller.isExpanded'],

    classNames: [
        'welcome-screen__demos__thumbnail'
    ],

    isConfirmDelete: false,

    isExpanded: function(){
        return !this.get('controllers.welcome.isDetailClosed') &&
            this.get('controllers.welcomeDemo.model') === this.get('model');
    }.property('controllers.welcomeDemo.model', 'model', 'controllers.welcome.isDetailClosed'),

    actions: {

        enter: function(){
            this.get('controllers.sfmStore').set('currentProject', this.get('model'));
            this.transitionToRoute('workspace');
        },

        confirmDelete: function(){
            this.toggleProperty('isConfirmDelete');
        },

        cancelDelete: function(){
            this.set('isConfirmDelete', false);
        },

        toggleDetail: function(){
            if (this.get('isExpanded')) {
                this.transitionToRoute('welcome');
            }
            else {
                this.transitionToRoute('welcome.demo', this.get('model'));
            }
        }

    }


});