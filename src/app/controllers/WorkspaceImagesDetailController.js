'use strict';

module.exports = Ember.Controller.extend({

    needs: ['projectResource'],

    resource: Ember.computed.alias('controllers.projectResource'),

    actions: {
        back: function(){
            this.transitionToRoute('workspace.images');
        }
    }

});