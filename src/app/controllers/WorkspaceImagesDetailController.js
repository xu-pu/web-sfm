'use strict';

var sfmstore = require('../store/sfmstore.js'),
    STORES = require('../settings.js').STORES;

module.exports = Ember.ObjectController.extend({

    isLoadng: true,

    dataurl: null,

    actions: {
        back: function(){
            this.transitionToRoute('workspace.images');
        }
    },

    onNewImage: function(){
        var _self = this;
        this.set('isLoading', true);
        sfmstore.promiseAdapter()
            .then(function(adapter){
                return adapter.promiseData(STORES.FULLIMAGES, _self.get('_id'));
            })
            .then(function(data){
                _self.set('dataurl', data);
                _self.set('isLoading', false);
            });
    }.observes('model')

});