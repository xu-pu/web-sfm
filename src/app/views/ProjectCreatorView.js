'use strict';

module.exports = Ember.View.extend({

    tagName: 'div',

    classNames: 'welcome-screen__projects__new',

    templateName: 'widgets/project-creator',

    InputView: Ember.TextField.extend({

        change: function(){
            this.get('controller').set('newProjectName', this.get('value'));
        }

    })

});