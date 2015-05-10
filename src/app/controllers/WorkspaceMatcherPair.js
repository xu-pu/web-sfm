'use strict';

module.exports = Ember.Controller.extend({

    needs: ['projectResource'],

    resource: Ember.computed.alias('controllers.projectResource'),

    queryParams: ['from', 'to', 'mode'],

    mode: 'epipolar',

    title: function(){
        return this.get('model.from.filename') + ' to ' + this.get('model.to.filename');
    }.property('from', 'to'),

    actions: {
        back: function(){
            this.transitionTo('workspace.matcher');
        }
    }

});