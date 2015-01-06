"use strict";

var _ = require('underscore');

var IDBAdapter = require('../store/StorageAdapter.js'),
    Task = require('../models/Task.js'),
    utils = require('../utils.js'),
    settings = require('../settings.js'),
    TASK_TYPE = settings.TASKS,
    STORES = settings.STORES,
    ENTRIES = settings.DEMO_ENTRY;

var MVS_PATH = '/mvs/option.txt.pset.json',
    BUNDLER_PATH = '/bundler/bundler.json';

module.exports = Ember.ObjectController.extend({

    needs: ['scheduler', 'context', 'demos'],

    scheduler: Ember.computed.alias('controllers.scheduler'),

    context: Ember.computed.alias('controllers.context'),

    demos: Ember.computed.alias('controllers.demos'),

    isInprogress: false,

    adapter: null,

    isDeleting: false,

    actions: {

        releaseDB: function(){
            var adapter = this.get('adapter');
            if (adapter) {
                adapter.close();
                console.log('release');
            }
            this.set('adapter', null);
        },

        'delete': function(){
            this.promiseDelete();
        },

        download: function(){
            this.promiseDownload();
        },

        enter: function(){
            this.get('context').set('currentProject', this.get('model'));
            this.transitionToRoute('workspace');
        }

    },


    syncLocalStorage: function(){
        this.get('demos').sync();
    }.observes('loadedImages.length', 'loadedFeatures.length', 'selectedEntries.length', 'loadedEntries.length'),


    watchForUnselect: function(){

        var _self = this,
            selected = this.get('selectedEntries'),
            loaded = this.get('loadedEntries');

        loaded.forEach(function(entry){
            switch (entry) {
                case ENTRIES.CALIBRATION:
                    if (!selected.contains(ENTRIES.CALIBRATION)) {
                        deleteCalibration();
                    }
                    break;
                case ENTRIES.MVS:
                    if (!selected.contains(ENTRIES.MVS)) {
                        deleteMVS();
                    }
                    break;
            }
        });

        if (!selected.contains(ENTRIES.IMAGE) && this.get('loadedImages.length') > 0) {
            deleteImage();
        }

        if (!selected.contains(ENTRIES.FEATURE) && this.get('loadedFeatures.length') > 0) {
            deleteFeature();
        }

        function deleteImage(){
            var adapter = new IDBAdapter(_self.get('name'));
            adapter
                .promiseClear(STORES.IMAGES)
                .then(function(){
                    _self.get('loadedImages').clear();
                    adapter.close();
                });
        }

        function deleteFeature(){
            var adapter = new IDBAdapter(_self.get('name'));
            adapter
                .promiseClear(STORES.FEATURES)
                .then(function(){
                    _self.get('loadedFeatures').clear();
                    adapter.close();
                });
        }

        function deleteMatch(){}

        function deleteCalibration(){
            var adapter = new IDBAdapter(_self.get('name'));
            adapter
                .promiseRemoveData(STORES.SINGLETONS, STORES.BUNDLER)
                .then(function(){
                    loaded.removeObject(ENTRIES.CALIBRATION);
                    adapter.close();
                });
        }

        function deleteMVS(){
            var adapter = new IDBAdapter(_self.get('name'));
            adapter
                .promiseRemoveData(STORES.SINGLETONS, STORES.MVS)
                .then(function(){
                    loaded.removeObject(ENTRIES.MVS);
                    adapter.close();
                });
        }

    }.observes('selectedEntries.length'),


    promiseDownload: function(){

        this.set('isInprogress', true);

        if (!this.get('adapter')) {
            this.set('adapter', new IDBAdapter(this.get('name')));
        }

        var _self = this, tasks = [];

        if (this.get('selectedImage')) {
            tasks.push(this.promiseDownloadImages());
        }

        if (this.get('selectedFeature')) {
            tasks.push(this.promiseDownloadFeatures());
        }

        if (this.get('selectedMatch')) {
            // todo
        }

        if (this.get('selectedCalibration')) {
            tasks.push(this.promiseDownloadCalibration());
        }

        if (this.get('selectedMVS')) {
            tasks.push(this.promiseDownloadMVS());
        }

        return Promise.all(tasks)
            .catch(function(){
                Ember.Logger.debug('download error');
            })
            .then(function(){
                _self.set('isInprogress', false);
                _self.send('releaseDB');
            });
    },


    promiseDownloadImages: function(){

        if (this.get('imagesFinished')) {
            return Promise.resolve();
        }

        var loaded = this.get('loadedImages'),
            images = this.get('images'),
            root = this.get('root'),
            adapter = this.get('adapter'),
            scheduler = this.get('scheduler');

        return Promise.all(images
            .filter(function(image){
                return !loaded.contains(image.id);
            })
            .map(function(image){

                var filename = image.name + image.extension,
                    imageUrl = root + '/images/' + filename,
                    task = Task.create({
                        type: TASK_TYPE.DOWNLOAD,
                        name: image.name + image.extension,
                        data: { url: imageUrl, type: 'blob' }
                    });

                return scheduler.promiseTask(task)
                    .then(function(blob){
                        task.destroy();
                        blob.name = filename;
                        return adapter.processImageFile(blob, image.id);
                    })
                    .then(function(){
                        loaded.addObject(image.id);
                    });

            }));
    },


    promiseDownloadFeatures: function(){

        if (!this.get('hasFeature')) {
            return Promise.reject('Feature is not avaliable in this demo!');
        }

        if (this.get('featuresFinished')) {
            return Promise.resolve();
        }

        var adapter = this.get('adapter'),
            root = this.get('root'),
            loaded = this.get('loadedFeatures'),
            images = this.get('images'),
            scheduler = this.get('scheduler');

        return Promise.all(images
            .filter(function(image){
                return !loaded.contains(image.id);
            })
            .map(function(image){

                var siftUrl = root + '/sift.json/' + image.name + '.json',
                    task = Task.create({
                        type: TASK_TYPE.DOWNLOAD,
                        name: image.name,
                        data: { url: siftUrl, type: 'json' }
                    });

                return scheduler.promiseTask(task)
                    .then(function(sift){
                        task.destroy();
                        return adapter.promiseSetData(STORES.FEATURES, image.id, sift.features);
                    })
                    .then(function(){
                        loaded.addObject(image.id);
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
            scheduler = this.get('scheduler'),
            task = Task.create({
                name: 'Camera Registration',
                type: TASK_TYPE.DOWNLOAD,
                data: { url: url, type: 'json' }
            });

        return scheduler.promiseTask(task)
            .then(function(data){
                task.destroy();
                return adapter.promiseSetData(STORES.SINGLETONS, STORES.BUNDLER, data);
            })
            .then(function(){
                _self.get('loadedEntries').addObject(ENTRIES.CALIBRATION);
                Ember.Logger.debug('Calibration downloaded and stored');
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

        var task = Task.create({
            name: 'Multi-View Stereo',
            type: TASK_TYPE.DOWNLOAD,
            data: { url: url, type: 'json' }
        });

        return scheduler.promiseTask(task)
            .then(function(data){
                task.destroy();
                return adapter.promiseSetData(STORES.SINGLETONS, STORES.MVS, data);
            })
            .then(function(){
                _self.get('loadedEntries').pushObject(ENTRIES.MVS);
                Ember.Logger.debug('MVS downloaded and stored');
            });

    },


    promiseDelete: function(){

        var _self = this,
            context = this.get('context');

        this.send('releaseDB');

        context.promiseProject()
            .then(function(project){
                if (project.get('name') === _self.get('name')) {
                    context.set('currentProject', null);
                }
            })
            .catch(function(){
                // no current project
            })
            .then(function(){
                _self.set('isDeleting', true);
                var request = indexedDB.deleteDatabase(_self.get('name'));
                request.onsuccess = function(){
                    _self.setProperties({
                        loadedImages: [],
                        loadedFeatures: [],
                        loadedEntries: [],
                        isDeleting: false
                    });
                };
            });
    }

});