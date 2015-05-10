"use strict";

var _ = require('underscore');

var settings = require('../settings.js'),
    STORES = settings.STORES,
    RESOURCE = settings.RESOURCE,
    utils = require('../utils.js');

module.exports = StorageAdapter;

/**
 * @typedef {{filename, width, height}} IDBImage
 */


/**
 * @param projectName
 * @constructor
 */
function StorageAdapter(projectName){
    this.project = projectName;
    this.connection = null;
}

StorageAdapter.prototype = {

    close: function(){
        if (this.connection) {
            this.connection.close();
            delete this.connection;
        }
    },

    promiseDB: function(){
        var _self = this;

        if (this.connection) {
            return Promise.resolve(this.connection);
        }
        else {
            return new Promise(function(resolve, reject){
                var request = indexedDB.open(_self.project, 30);
                request.onupgradeneeded = function(e){
                    console.log('upgrade');
                    _self.connection = e.target.result;
                    _self.createStores(_self.connection);
                };
                request.onsuccess = function(e){
                    //Ember.Logger.debug('db success');
                    _self.connection = e.target.result;
                    resolve(_self.connection);
                };
                request.onerror = function(reason){
                    Ember.Logger.debug(reason);
                    reject();
                };
            });
        }
    },


    /**
     * @param {IDBDatabase} db
     */
    createStores: function(db){
        console.log('create');
        if (!db.objectStoreNames.contains(RESOURCE.IMAGES)) {
            db.createObjectStore(RESOURCE.IMAGES, { autoIncrement: true }) // image information
                .createIndex('name', 'name', { unique: true });

        }
        [
//            STORES.FEATURES,
//            STORES.FULLIMAGES,
//            STORES.THUMBNAILS,
//            STORES.MATCHES,
//            STORES.SINGLETONS
            RESOURCE.FEATURE_POINTS,
            RESOURCE.FEATURE_VECTORS,
            RESOURCE.SINGLETONS,
//            RESOURCE.IMAGES,
            RESOURCE.FULLIMAGES,
            RESOURCE.ROBUST_MATCHES,
            RESOURCE.RAW_MATCHES
//            STORES.FULLIMAGES,
//            STORES.THUMBNAILS,
//            STORES.MATCHES,
//            STORES.SINGLETONS

        ].forEach(function(name){
                if (!db.objectStoreNames.contains(name)) {
                    db.createObjectStore(name);
                }
            });
    },


    /**
     *
     * @param {File} file
     * @return {Promise}
     */
    processImageFile: function(file){

        //Ember.Logger.debug('file process begins');

        var _self = this,
            image,
            domimg,
            domstring = URL.createObjectURL(file);

        return utils.promiseLoadImage(domstring)
            .then(function(img){
                //Ember.Logger.debug('img object required');
                domimg = img;
                image = {
                    filename: file.name,
                    width: img.width,
                    height: img.height,
                    thumbnail: utils.getImageThumbnail(domimg)
                };
                return _self.promiseAddData(RESOURCE.IMAGES, image);
            })
            .then(function(newid){
                //Ember.Logger.debug('id aquired');
                image.id = newid;
                return utils.promiseFileBuffer(file);
            })
            .then(function(buffer){
                //Ember.Logger.debug('ArrayBuffer Loaded');
                return _self.promiseSetData(RESOURCE.FULLIMAGES, image.id, buffer);
            })
            .then(function(){
                //Ember.Logger.debug('One image imported');
                return image;
            });

    },


    /**
     *
     * @param store
     * @param key
     * @return {Promise}
     */
    promiseData: function(store, key){
        var _self = this;
        return new Promise(function(resolve, reject){
            _self.promiseDB().then(function(db){
                db.transaction(store).objectStore(store).get(key).onsuccess = function(e){
                    var result = e.target.result;
                    if (_.isUndefined(result)) {
                        reject(result)
                    }
                    else {
                        resolve(result);
                    }
                };
            });
        });
    },


    /**
     * @param {String} store
     * @param {String} key
     * @param data
     * @returns {Promise}
     */
    promiseSetData: function(store, key, data){
        var _self = this;
        return new Promise(function(resolve){
            _self.promiseDB().then(function(db){
                var request = db.transaction(store, 'readwrite').objectStore(store).put(data, key);
                request.onsuccess = function(e){
                    resolve(e.target.result);
                };
                request.onerror = function(e){
                    console.log(e);
                };
            });
        });
    },

    /**
     * @param {String} store
     * @param data
     * @returns {Promise}
     */
    promiseAddData: function(store, data){
        var _self = this;
        return new Promise(function(resolve){
            _self.promiseDB().then(function(db){
                db.transaction(store, 'readwrite').objectStore(store).add(data).onsuccess = function(e){
                    resolve(e.target.result);
                }
            });
        });
    },

    promiseRemoveData: function(store, key){
        var _self = this;
        return new Promise(function(resolve){
            _self.promiseDB().then(function(db){
                db.transaction(store, 'readwrite').objectStore(store).delete(key).onsuccess = function(){
                    resolve(true);
                }
            });
        });
    },

    promiseClear: function(store){
        var _self = this;
        return new Promise(function(resolve){
            _self.promiseDB().then(function(db){
                db.transaction(store, 'readwrite').objectStore(store).clear().onsuccess = function(){
                    resolve(true);
                }
            });
        });
    },

    promiseFindBy: function(store, index, key){
        var _self = this;
        return new Promise(function(resolve, reject){
            _self.promiseDB().then(function(db){
                db.transaction(store).objectStore(store).index(index).get(key).onsuccess = function(e){
                    var result = e.target.result;
                    if (_.isUndefined(result)) {
                        reject(result)
                    }
                    else {
                        resolve(result);
                    }
                };
            });
        });
    },


    promiseAll: function(store){
        var _self = this;
        return new Promise(function(resolve, reject){
            var results = [];
            _self.queryEach(store, function(key, value){
                results.push({ key: key, value: value });
            }, function(){
                resolve(results);
            });
        });
    },


    queryEach: function(name, callback, terminate){
        this.promiseDB().then(function(db){
            db.transaction(name).objectStore(name).openCursor().onsuccess = function(e){
                var cursor = e.target.result;
                if (cursor) {
                    callback(cursor.key, cursor.value);
                    cursor.continue();
                }
                else {
                    terminate();
                }
            }
        });
    }

};