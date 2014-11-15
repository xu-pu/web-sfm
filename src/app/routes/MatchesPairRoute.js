'use strict';

module.exports =  Ember.Route.extend({

    model: function(params){
        return new Promise(function(resolve, reject){
            var id1 = parseInt(params.pair.split('&')[0]),
                id2 = parseInt(params.pair.split('&')[1]);
            var bigger = id1<id2 ? id2 : id1,
                smaller = id1<id2 ? id1 : id2;
            App.SfmStore.promiseImages().then(function(images){
                resolve({
                    view1: images.findBy('_id', smaller),
                    view2: images.findBy('_id', bigger)
                });
            }, reject);
        });
    },

    serialize: function(model){
        return { pair: model.view1.get('_id') + '&' + model.view2.get('_id') };
    }

});