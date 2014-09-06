'use strict';

var utils = require('../utils.js'),
    sfmstore = require('../store/sfmstore.js'),
    STORES = require('../settings.js').STORES;

module.exports = Ember.ObjectController.extend({

    img: null,

    features: null,

    isLoading: true,

    actions: {
        back: function(){
            this.transitionToRoute('workspace.extractor');
        }
    },

    onNewImage: function(){
        var _self = this;
        this.set('isLoading', true);
        sfmstore
            .promiseAdapter()
            .then(function(adapter){
                return Promise.all([
                    adapter.promiseData(STORES.FULLIMAGES, _self.get('_id')).then(utils.promiseLoadImage),
                    adapter.promiseData(STORES.FEATURES, _self.get('_id'))
                ]);
            })
            .then(function(results){
                _self.set('img', results[0]);
                _self.set('features', results[1]);
                _self.set('isLoading', false);
            });
    }.observes('model')

});