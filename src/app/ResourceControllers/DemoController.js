"use strict";

var _ = require('underscore');

var IDBAdapter = require('../store/StorageAdapter.js'),
    utils = require('../utils.js'),
    settings = require('../settings.js'),
    STORES = settings.STORES;

var MVS_PATH = '/mvs/option.txt.pset.json',
    BUNDLER_PATH = '/bundler/bundler.json';

module.exports = Ember.ObjectController.extend({

    needs: ['scheduler', 'context'],

    scheduler: Ember.computed.alias('controllers.scheduler'),

    context: Ember.computed.alias('controllers.context'),

    isInprogress: false,

    adapter: null,

    isDeleting: false,

    actions: {

        'delete': function(){
            this.promiseDelete();
        },

        download: function(){
            this.promiseDownload();
        }


    },

    syncLocalStorage: function(){
        this.get('context').syncDemos();
    }.observes('finishedImages.length','finishedSIFT.length','bundlerFinished','mvsFinished'),


    isPending: function(){}.property(),

    promiseDownload: function(){

        this.set('isInprogress', true);

        var _self = this,
            tasks = [this.promiseDownloadImages()];

        if (this.get('selectedFeature')) {
            tasks.push(this.promiseDownloadFeatures());
        }

        if (this.get('selectedCalibration')) {
            tasks.push(this.promiseDownloadCalibration());
        }

        if (this.get('selectedMVS')) {
            tasks.push(this.promiseDownloadMVS());
        }

        return Promise.all(tasks)
            .then(function(){
                _self.set('isInprogress', false);
            })
            .catch(function(){
                Ember.Logger.debug('download error');
                _self.set('isInprogress', false);
            });
    },


    promiseDownloadImages: function(){

        if (this.get('imagesFinished')) {
            return Promise.resolve();
        }

        var _self = this,
            loaded = this.get('loadedImages'),
            images = this.get('images'),
            root = this.get('root'),
            adapter = this.get('adapter'),
            scheduler = this.get('scheduler');

        return Promise.all(images
            .filter(function(image){
                return loaded.indexOf(image.id) === -1;
            })
            .map(function(image){
                var imageUrl = root + '/images/' + name + image.extension;
                var task = DownloadTask.create({
                    name: name,
                    demo: _self,
                    resolve: resolve,
                    url: imageUrl,
                    type: TYPES.BLOB
                });
                return scheduler.promiseTask(task)
                    .then(function(blob){
                        blob.name = name;
                        return adapter.processImageFile(blob, image.id);
                    })
                    .then(function(){
                        _self.get('loadedImages').addObject(image.id);
                    });
            }));
    },


    promiseDownloadFeatures: function(){

        if (this.get('hasSIFT') && this.get('siftFinished')) {
            return Promise.resolve();
        }

        var _self = this,
            adapter = this.get('adapter'),
            root = this.get('root'),
            loaded = this.get('loadedFeatures'),
            images = this.get('images'),
            scheduler = this.get('scheduler');

        return Promise.all(images
            .filter(function(image){
                return loaded.indexOf(image.id) === -1;
            })
            .map(function(image){

                var siftUrl = root + '/sift.json/' + image.name + '.json';

                var task = Task.create({
                    name: image.name,
                    demo: _self,
                    resolve: resolve,
                    url: siftUrl,
                    type: TYPES.JSON
                });

                return scheduler.promiseTask(task)
                    .then(function(sift){
                        return adapter.promiseSetData(STORES.FEATURES, image.id, sift.features);
                    })
                    .then(function(){
                        _self.get('finishedSIFT').addObject(image.id);
                    });

            }));

    },


    promiseDownloadCalibration: function(){

        if (!this.get('hasCalibration')) {
            return Promise.reject('Bundler result is not avaliable in this demo!');
        }

        if (this.get('calibrationLoaded')) {
            return Promise.resolve();
        }

        var adapter = this.get('adapter'),
            _self = this,
            url = this.get('root')+BUNDLER_PATH,
            scheduler = this.get('scheduler');

        var task = Task.create({
            name: 'Camera Registration',
            demo: _self,
            resolve: resolve,
            url: url,
            type: TYPES.JSON
        });

        return scheduler.promiseTask(task)
            .then(function(data){
                return adapter.promiseSetData(STORES.SINGLETONS, STORES.BUNDLER, data);
            })
            .then(function(){
                _self.set('calibrationLoaded', true);
                Ember.Logger.debug('Bundler downloaded and stored');
            });

    },


    promiseDownloadMVS: function(){

        if (!this.get('hasMVS')) {
            return Promise.reject('MVS result is not avaliable in this demo!');
        }

        if (this.get('mvsLoaded')) {
            return Promise.resolve();
        }

        var _self = this,
            adapter = this.get('adapter'),
            url = this.get('root')+MVS_PATH,
            scheduler = this.get('scheduler');

        var task  = Task.create({
            name: 'Multi-View Stereo',
            demo: _self,
            resolve: resolve,
            url: url,
            type: TYPES.JSON
        });

        return scheduler.promiseTask(task)
            .then(function(data){
                return adapter.promiseSetData(STORES.SINGLETONS, STORES.MVS, data);
            })
            .then(function(){
                _self.set('mvsLoaded', true);
                Ember.Logger.debug('MVS downloaded and stored');
            });

    },


    promiseDelete: function(){
        var _self = this,
            context = this.get('context');

        context.promiseProject()
            .then(function(project){
                if (project.get('name') === _self.get('name')) {
                    context.set('currentProject', null);
                }
            })
            .catch()
            .then(function(){
                _self.set('isDeleting', true);
                var request = indexedDB.deleteDatabase(_self.get('name'));
                request.onsuccess = function(){
                    _self.setProperties({
                        'finishedImages': [],
                        'finishedSIFT': [],
                        'bundlerFinished': false,
                        'mvsFinished': false
                    });
                    _self.set('isDeleting', false);
                };
            });
    }

});