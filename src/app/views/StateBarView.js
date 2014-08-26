var STAGES = require('../settings.js').STAGES;

module.exports = Ember.View.extend({

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
                case STAGES.BEFORE:
                    return 'begin';
                case STAGES.EXTRACTOR:
                    return 'extracting SIFT features';
                case STAGES.MATCHING:
                    return 'matching features between two-views';
                case STAGES.TRACKING:
                    return 'tracking consistent tracks from matches';
                case STAGES.REGISTER:
                    return 'Calibrating Cameras';
                default:
                    throw 'invalid application stage';
            }
        }.property('controller.stage')

    })

});