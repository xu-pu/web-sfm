"use strict";

var IDBAdapter = require('../store/StorageAdapter.js'),
    utils = require('../utils.js'),
    settings = require('../settings.js'),
    STORES = settings.STORES;

var MVS_PATH = '/mvs/option.txt.pset.json',
    BUNDLER_PATH = '/bundler/bundler.json';


module.exports = Ember.ObjectController.extend({

    isDownloaded: false,
    isInprogress: false,

    adapter: null,

    finishedImages: false,
    finishedSIFT: false,
    finishedBundler: false,
    finishedMVS: false,

    actions: {
        download: function(){
            this.promiseLoad();
        }
    },


    promiseLoad: function(){
        Ember.Logger.debug('project storage adapter created');
        var adapter = new IDBAdapter(this.get('name'));
        this.set('adapter', adapter);
        this.promiseResume().then(this.promiseDownload.bind(this));
    },

    promiseResume: function(){
        var _self = this,
            adapter = new IDBAdapter(this.get('name'));

        this.set('adapter', adapter);
        this.set('isInprogress', true);

        var mvsResumed = adapter
            .promiseData(STORES.SINGLETONS, STORES.MVS)
            .then(function(){
                _self.set('finishedMVS', true);
            })
            .catch();

        var bundlerResumed = adapter
            .promiseData(STORES.SINGLETONS, STORES.BUNDLER)
            .then(function(){
                _self.set('finishedBundler', true);
            })
            .catch();

        return Promise.all([
            bundlerResumed,
            mvsResumed
        ]);
    },


    promiseDownload: function(){
        var _self = this;
        if (this.get('downloaded')) {
            return Promise.resolve();
        }
        return this.promiseResume()
            .then(function(){
                return Promise.all([
//                        _self.promiseDownloadImages(),
//                        _self.promiseDownloadSIFT(),
                    _self.promiseDownloadBundler(),
                    _self.promiseDownloadMVS()
                ]);
            })
            .catch(function(msg){
                Ember.Logger.debug(msg);
                _self.set('isInprogress', false);
            })
            .then(function(){
                _self.set('isDownloaded', true);
                _self.set('isInprogress', false);
            });
    },


    promiseDownloadImages: function(){
        if (this.get('finishedImages')) {
            return Promise.resolve();
        }
        return Promise.all(this.get('images').map(this.promiseProcessOneImage.bind(this)));
    },


    promiseDownloadSIFT: function(){

        var adapter = this.get('adapter'),
            root = this.get('root'),
            _self = this;

        if (this.get('hasSIFT') && this.get('finishedSIFT')) {
            return Promise.resolve();
        }
        else {
            return adapter.promiseAll(STORES.IMAGES)
                .then(function(images){
                    return Promise.all(images.map(function(result){
                        return _self.promiseDownloadOneSIFT(result.key, result.value);
                    }));
                });
        }
    },


    promiseDownloadBundler: function(){
        if (!this.get('hasBundler')) {
            return Promise.reject('Bundler result is not avaliable in this demo!');
        }
        if (this.get('finishedBundler')) {
            return Promise.resolve();
        }
        var adapter = this.get('adapter');
        return utils.requireJSON(this.get('root')+BUNDLER_PATH)
            .then(function(data){
                return adapter.promiseSetData(STORES.SINGLETONS, STORES.BUNDLER, data);
            })
            .then(function(){
                Ember.Logger.debug('Bundler downloaded and stored');
            });
    },


    promiseDownloadMVS: function(){
        if (!this.get('hasMVS')) {
            return Promise.reject('MVS result is not avaliable in this demo!');
        }
        if (this.get('finishedMVS')) {
            return Promise.resolve();
        }
        var adapter = this.get('adapter');
        var url = this.get('root')+MVS_PATH;
        return utils.requireJSON(url)
            .then(function(data){
                return adapter.promiseSetData(STORES.SINGLETONS, STORES.MVS, data);
            })
            .then(function(){
                Ember.Logger.debug('MVS downloaded and stored');
            });
    },


    /**
     *
     * @param {String} _id
     * @param {IDBImage} image
     * @returns {Promise}
     */
    promiseDownloadOneSIFT: function(_id, image){
        var adapter = this.get('adapter'),
            rawName = image.filename.split('.')[0],
            siftUrl = this.get('root') + '/sift.json/' + rawName + '.json';

        return utils.requireJSON(siftUrl)
            .then(function(sift){
                return adapter.promiseSetData(STORES.FEATURES, _id, sift.features);
            });
    },


    promiseProcessOneImage: function(name){
        var imageUrl = this.get('root') + '/images/' + name,
            adapter = this.get('adapter');

        return utils.requireImageFile(imageUrl)
            .then(function(blob){
                blob.name = name;
                return adapter.processImageFile(blob);
            });
    }

});