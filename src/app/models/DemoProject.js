"use strict";

var IDBAdapter = require('../store/StorageAdapter.js'),
    utils = require('../utils.js'),
    settings = require('../settings.js'),
    STORES = settings.STORES;

var MVS_PATH = '/mvs/option.txt.pset.json',
    BUNDLER_PATH = '/bundler/bundler.json';


module.exports = Ember.Object.extend({

    loaded: false,

    adapter: null,

    finishedImages: false,
    finishedBundler: false,
    finishedMVS: false,


    promiseLoad: function(){
        Ember.Logger.debug('project storage adapter created');
        var adapter = new IDBAdapter(this.get('name'));
        this.set('adapter', adapter);
        this.promiseResume().then(this.promiseDownload.bind(this));
    },

    promiseResume: function(){
        var _self = this;
        var adapter = new IDBAdapter(this.get('name'));
        this.set('adapter', adapter);
        var mvsResumed = adapter
            .promiseData(STORES.SINGLETONS, STORES.MVS)
            .then(function(){
                _self.set('finishedMVS', true);
            });
        var bundlerResumed = adapter
            .promiseData(STORES.SINGLETONS, STORES.BUNDLER)
            .then(function(){
                _self.set('finishedBundler', true);
            });
        return Promise.all([
            bundlerResumed,
            mvsResumed
        ]);
    },


    promiseDownload: function(){
        return this.promiseDownloadImages()
            .then(this.promiseDownloadBundler)
            .then(this.promiseDownloadMVS);
    },


    promiseDownloadImages: function(){
        if (this.get('finishedImages')) {
            return Promise.resolve();
        }
        return Promise.all(this.get('images').map(this.promiseProcessOneImage.bind(this)));
    },


    promiseDownloadBundler: function(){
        if (this.get('finishedBundler')) {
            return Promise.resolve();
        }
        return utils.requireJSON(this.get('root')+BUNDLER_PATH);
    },


    promiseDownloadMVS: function(){
        if (this.get('finishedMVS')) {
            return Promise.resolve();
        }
        var adapter = this.get('adapter');
        var url = this.get('root')+MVS_PATH;
        return utils.requireJSON(url).then(function(data){
            return adapter.promiseSetData(STORES.SINGLETONS, STORES.MVS, data);
        });
    },


    promiseProcessOneImage: function(name){
        var rawName = name.split('.')[0],
            root = this.get('root'),
            adapter = this.get('adapter'),
            finishedImages = this.get('finishedImages'),
            finishedSIFT = this.get('finishedSIFT');

        var imageUrl = root + '/images/' + name,
            siftUrl = root + '/sift.json/' + rawName + '.json';

        return utils.requireImageFile(imageUrl)
            .then(function(blob){
                blob.name = name;
                return Promise.all([
                    adapter.processImageFile(blob),
                    utils.requireJSON(siftUrl)
                ]);
            })
            .then(function(results){
                finishedImages.addObject(name);
                var _id = results[0],
                    sift = results[1].features;
                return adapter.promiseSetData(STORES.FEATURES, _id, sift);
            })
            .then(function(){
                finishedSIFT.addObject(name);
            });
    }

});