'use strict';

module.exports = Ember.View.extend({

    tagName: 'div',

    classNames: 'welcome-screen__projects__new',

    classNameBindings: ['isInvalid'],

    isInvalid: function(){
        return !this.get('controller.isValidName');
    }.property('controller.isValidName'),

    templateName: 'widgets/project-creator',

    store: Ember.computed.alias('controller.controllers.sfmStore'),

    InputView: Ember.TextField.extend({

        refresh: function(){
            this.set('value', '');
        },

        keyUp: function(){
            this.syncContent();
        },

        change: function(){
            this.syncContent();
        },

        syncContent: function(){
            this.get('parentView.controller').set('newProjectName', this.get('value'));
        }

    })

});