'use strict';

App.StateBarView = Ember.View.extend({

    templateName: 'widgets/state-bar',

    expand: false,

    InfoView: Ember.View.extend({

        tagName: 'div',

        classNames: ['controll-panel__state-bar__body'],

        click: function(){
            if (this.get('parentView').get('expand')){
                this.get('parentView').set('expand', false);
            }
            else {
                this.get('parentView').set('expand', true);
            }
        }

    })

});