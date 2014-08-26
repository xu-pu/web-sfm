"use strict";

var IDBAdapter = require('../store/StorageAdapter.js'),
    Image = require('../models/image.js'),
    Matches = require('../models/Matches.js'),
    utils = require('../utils.js'),
    settings = require('../settings.js'),
    STORES = settings.STORES;

/**
 * It is different from DemoProject, the Project object contains the state of SFM
 */
module.exports = Ember.Object.extend({

    images: null,

    matches: null,

    promiseLoad: function(){
        var adapter = new IDBAdapter(this.get('name'));
        this.set('adapter', adapter);
    },

    /**
     * @returns {Promise}
     */
    promiseImages: function(){
        var _self = this,
            adapter = this.get('adapter');
        return new Promise(function(resolve, reject){
            var images = _self.get('images');
            if (images){
                resolve(images);
            }
            else {
                images = [];
                adapter.queryEach('images',
                    function(key, value){
                        value._id = key;
                        images.addObject(Image.create(value));
                    },
                    function(){
                        resolve(images);
                    }
                );
            }
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