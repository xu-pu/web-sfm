'use strict';

module.exports = Ember.ArrayController.extend({

    model: null,

    needs: ['context'],

    currentProject: Ember.computed.alias('controllers.context.currentProject'),

    clearCache: function(){
        this.set('model', null);
        console.log('cleared');
    }.observes('currentProject')

});