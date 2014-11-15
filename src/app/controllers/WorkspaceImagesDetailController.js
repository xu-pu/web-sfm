'use strict';

var STORES = require('../settings.js').STORES;

module.exports = Ember.ObjectController.extend({

    needs: ['sfmStore'],

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
            adapter = this.get('controllers.sfmStore.adapter');

        return adapter
            .promiseData(STORES.FULLIMAGES, _self.get('_id'))
            .then(function(data){
                var domstring = URL.createObjectURL(new Blob([data]));
                _self.set('dataurl', domstring);
                _self.set('isLoading', false);
            });

    }.observes('model')

});