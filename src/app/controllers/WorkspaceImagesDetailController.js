'use strict';

var settings = require('../settings.js'),
    RESOURCE = settings.RESOURCE;

module.exports = Ember.ObjectController.extend({

    needs: ['workspace', 'projectResource'],

    resource: Ember.computed.alias('controllers.projectResource'),

    adapter: Ember.computed.alias('controllers.workspace.adapter'),

    isLoadng: true,

    dataurl: null,

    actions: {
        back: function(){
            this.transitionToRoute('workspace.images');
        }
    },

    onNewImage: function(){

        this.set('isLoading', true);

        var _self = this,
            adapter = this.get('adapter');

        return this.get('resource')
            .promiseResource(RESOURCE.FULLIMAGES, this.get('model'))
            .then(function(data){
                var domstring = URL.createObjectURL(new Blob([data]));
                _self.set('dataurl', domstring);
                _self.set('isLoading', false);
            });

    }.observes('model')

});