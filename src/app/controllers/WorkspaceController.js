"use strict";

var IDBAdapter = require('../store/StorageAdapter.js'),
    Image = require('../models/Image.js'),
    Matches = require('../models/Matches.js'),
    utils = require('../utils.js'),
    settings = require('../settings.js'),
    STORES = settings.STORES;

module.exports = Ember.ObjectController.extend({

    adapter: null,

    isRunning: false,

    imageModels: null,

    threadPoolSize: 4,

    init: function(){
        this._super();
        this.set('adapter', new IDBAdapter(this.get('name')));
    },

    actions: {
        enter: function(route){
            this.transitionToRoute(route);
        }
    },

    /**
     * @returns {Promise}
     */
    promiseImages: function(){
        var _self = this;
        if (this.get('imageModels')){
            return Promise.resolve(this.get('imageModels'));
        }
        return this.get('adapter')
            .promiseAll(STORES.IMAGES)
            .then(function(results){
                _self.set('imageModels', results.map(function(res){
                    res.value._id = res.key;
                    Image.create(res.value)
                }));
                return _self.get('imageModels');
            });
    },

    promiseTracks: function(){
        var adapter = this.get('adapter');
        return Promise.all([
            this.promiseImages(),
            adapter.promiseData(STORES.SINGLETONS, STORES.TRACKS),
            adapter.promiseData(STORES.SINGLETONS, STORES.VIEWS)
        ]).then(function(values){
            return Promise.resolve({
                images: values[0],
                tracks: values[1],
                views: values[2]
            });
        });
    },


    /**
     *
     * @returns {Promise}
     */
    promiseMatches: function(){
        var _self = this,
            matches = this.get('matches'),
            adapter = this.get('adapter');
        if (matches) {
            return Promise.resolve(matches);
        }
        else {
            return this.promiseImages().then(function(imgs){
                return new Promise(function(resolve, reject){
                    var storedMatches = [];
                    adapter.queryEach(STORES.MATCHES,
                        function(key, value){
                            storedMatches.push(key);
                        },
                        function(){
                            _self.set('matches', Matches.create({
                                images: imgs,
                                finished: storedMatches
                            }));
                            resolve(_self.get('matches'));
                        }
                    );
                });

            });
        }
    }


});