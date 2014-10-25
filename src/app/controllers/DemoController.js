"use strict";

var _ = require('underscore');

var IDBAdapter = require('../store/StorageAdapter.js'),
    utils = require('../utils.js'),
    sfmstore = require('../store/sfmstore.js'),
    settings = require('../settings.js'),
    STORES = settings.STORES;

var MVS_PATH = '/mvs/option.txt.pset.json',
    BUNDLER_PATH = '/bundler/bundler.json';


module.exports = Ember.ObjectController.extend({

    isInprogress: false,

    adapter: null,

    isConfirmDelete: false,

    isDeleting: false,

    actions: {

        'delete': function(){
            this.set('isConfirmDelete', false);
            this.promiseDelete();
        },

        download: function(){
            this.promiseLoad();
        },

        enter: function(){
            sfmstore.setCurrentProject(this.get('model'));
            this.transitionToRoute('workspace');
        },

        confirmDelete: function(){
            // toggle behaviour
            if (this.get('isConfirmDelete')) {
                this.set('isConfirmDelete', false);
            }
            else {
                this.set('isConfirmDelete', true);
            }
        },

        cancelDelete: function(){
            this.set('isConfirmDelete', false);
        }

    },

    promiseDelete: function(){
        var _self = this;
        sfmstore
            .promiseProject(function(project){
                if (project.get('name') === _self.get('name')) {
                    sfmstore.setCurrentProject(null);
                }
            })
            .catch()
            .then(function(){
                var request = indexedDB.deleteDatabase(_self.get('name'));
                request.onsuccess = function(){
                    _self.setProperties({
                        'finishedImages': [],
                        'finishedSIFT': [],
                        'bundlerFinished': false,
                        'mvsFinished': false
                    });
                };
            });
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
                _self.set('mvsFinished', true);
            })
            .catch(function(){
                Ember.Logger.debug('Data is not avaliable in IDB, need download.');
            });

        var bundlerResumed = adapter
            .promiseData(STORES.SINGLETONS, STORES.BUNDLER)
            .then(function(){
                _self.set('bundlerFinished', true);
            })
            .catch(function(){
                Ember.Logger.debug('Data is not avaliable in IDB, need download.');
            });

        var imagesResumed = adapter
            .promiseAll(STORES.IMAGES)
            .then(function(results){
                var finished = results.map(function(res){
                    return res.value.filename;
                });
                _self.set('finishedImages', finished);
            })
            .catch(function(){
                Ember.Logger.debug('Data is not avaliable in IDB, need download.');
            });

        var siftResumed = adapter
            .promiseAll(STORES.FEATURES)
            .then(function(results){
                var finished = results.map(function(res){
                    return res.key;
                });
                _self.set('finishedSIFT', finished);
            })
            .catch(function(){
                Ember.Logger.debug('Data is not avaliable in IDB, need download.');
            });

        return Promise.all([
            imagesResumed,
            siftResumed,
            bundlerResumed,
            mvsResumed
        ]);
    },


    promiseDownload: function(){
        var _self = this;
        if (this.get('downloaded')) {
            return Promise.resolve();
        }
        return _self.promiseDownloadImages()
            .then(this.promiseDownloadSIFT.bind(this))
            .then(this.promiseDownloadBundler.bind(this))
            .then(this.promiseDownloadMVS.bind(this))
            .catch(function(msg){
                Ember.Logger.debug(msg);
                Ember.Logger.debug('download error');
                _self.set('isInprogress', false);
            })
            .then(function(){
                _self.set('isInprogress', false);
            });
    },


    promiseDownloadImages: function(){
        if (this.get('imagesFinished')) {
            return Promise.resolve();
        }
        var unfinished = _.difference(this.get('images'), this.get('finishedImages'));
        return Promise.all(unfinished.map(this.promiseProcessOneImage.bind(this)));
    },


    promiseDownloadSIFT: function(){

        var adapter = this.get('adapter'),
            root = this.get('root'),
            _self = this;

        if (this.get('hasSIFT') && this.get('siftFinished')) {
            return Promise.resolve();
        }
        return adapter.promiseAll(STORES.IMAGES)
            .then(function(images){
                return Promise.all(images
                    .filter(function(res){
                        return _self.get('finishedSIFT').indexOf(res.key) === -1;
                    })
                    .map(function(result){
                        return _self.promiseDownloadOneSIFT(result.key, result.value);
                    }));
            });
    },


    promiseDownloadBundler: function(){
        if (!this.get('hasBundler')) {
            return Promise.reject('Bundler result is not avaliable in this demo!');
        }
        if (this.get('bundlerFinished')) {
            return Promise.resolve();
        }
        var adapter = this.get('adapter'),
            _self = this;
        return utils.requireJSON(this.get('root')+BUNDLER_PATH)
            .then(function(data){
                return adapter.promiseSetData(STORES.SINGLETONS, STORES.BUNDLER, data);
            })
            .then(function(){
                _self.set('bundlerFinished', true);
                Ember.Logger.debug('Bundler downloaded and stored');
            });
    },


    promiseDownloadMVS: function(){
        if (!this.get('hasMVS')) {
            return Promise.reject('MVS result is not avaliable in this demo!');
        }
        if (this.get('mvsFinished')) {
            return Promise.resolve();
        }
        var _self = this,
            adapter = this.get('adapter'),
            url = this.get('root')+MVS_PATH;
        return utils.requireJSON(url)
            .then(function(data){
                return adapter.promiseSetData(STORES.SINGLETONS, STORES.MVS, data);
            })
            .then(function(){
                _self.set('mvsFinished', true);
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
        var _self = this,
            adapter = this.get('adapter'),
            rawName = image.filename.split('.')[0],
            siftUrl = this.get('root') + '/sift.json/' + rawName + '.json';

        return utils.requireJSON(siftUrl)
            .then(function(sift){
                return adapter.promiseSetData(STORES.FEATURES, _id, sift.features);
            })
            .then(function(){
                _self.get('finishedSIFT').addObject(_id);
            });
    },


    promiseProcessOneImage: function(name){
        var _self = this,
            imageUrl = this.get('root') + '/images/' + name,
            adapter = this.get('adapter');

        return utils.requireImageFile(imageUrl)
            .then(function(blob){
                blob.name = name;
                return adapter.processImageFile(blob);
            })
            .then(function(image){
                _self.get('finishedImages').addObject(name);
            });
    }

});