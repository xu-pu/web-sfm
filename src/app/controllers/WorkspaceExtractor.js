'use strict';

module.exports = Ember.Controller.extend({

    images: Ember.computed.alias('model'),

    actions: {
        expand: function(model){
            this.transitionToRoute('workspace.extractor.image', model);
        }
    }

});