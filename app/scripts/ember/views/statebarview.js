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
        },

        description: function(){
            switch (this.controller.get('stage')) {
                case SFM.STAGE_BEFORE:
                    return 'begin';
                case SFM.STAGE_EXTRACTOR:
                    return 'extracting SIFT features';
                case SFM.STAGE_MATCHING:
                    return 'matching features between two-views';
                case SFM.STAGE_TRACKING:
                    return 'tracking consistent tracks from matches';
                default:
                    throw 'invalid application stage';
            }
        }.property('controller.stage')

    })

});