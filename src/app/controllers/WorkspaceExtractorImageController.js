'use strict';

var utils = require('../utils.js'),
    STORES = require('../settings.js').STORES;

module.exports = Ember.ObjectController.extend({

    needs: ['workspace'],

    adapter: Ember.computed.alias('controllers.workspace.adapter'),

    img: null,

    features: null,

    isLoading: true,

    actions: {
        back: function(){
            this.transitionToRoute('workspace.extractor');
        }
    },

    onNewImage: function(){

        this.set('isLoading', true);

        var _self = this,
            adapter = this.get('adapter');

        return Promise.all([
            adapter.promiseData(STORES.FULLIMAGES, _self.get('_id')).then(utils.promiseBufferImage),
            adapter.promiseData(STORES.FEATURES, _self.get('_id'))
        ]).then(function(results){
            _self.setProperties({
                img: results[0],
                features: results[1],
                isLoading: false
            });
        });

    }.observes('model')

});