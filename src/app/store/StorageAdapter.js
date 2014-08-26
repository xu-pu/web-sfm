module.exports = StorageAdapter;

/**
 * @param projectName
 * @constructor
 */
function StorageAdapter(projectName){
    this.project = projectName;
    this.connection = null;
}

StorageAdapter.prototype = {

    promiseDB: function(){
        var _self = this;
        return new Promise(function(resolve, reject){
            if (_self.connection) {
                resolve(_self.connection);
            }
            else {
                var request = indexedDB.open(_self.project, 5);
                request.onupgradeneeded = function(e){
                    console.log('upgrade');
                    _self.connection = e.target.result;
                    _self.createStores(_self.connection);
                };
                request.onsuccess = function(e){
                    Ember.Logger.debug('db success');
                    _self.connection = e.target.result;
                    resolve(_self.connection);
                };
                request.onerror = function(reason){
                    Ember.Logger.debug(reason);
                    reject();
                };
            }
        });
    },


    /**
     * @param {IDBDatabase} db
     */
    createStores: function(db){
        console.log('create');
        if (!db.objectStoreNames.contains(SFM.STORE_IMAGES)) {
            db.createObjectStore(SFM.STORE_IMAGES, { autoIncrement: true }) // image information
                .createIndex('filename', 'filename', { unique: true });

        }
        [   SFM.STORE_FEATURES,
            SFM.STORE_FULLIMAGES,
            SFM.STORE_THUMBNAILS,
            SFM.STORE_MATCHES,
            SFM.STORE_SINGLETONS
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
        Ember.Logger.debug('file process begins');
        var dataUrl, _id, _self = this;
        return App.Utils.promiseDataUrl(file).then(function(result){
            Ember.Logger.debug('image dataUrl required');
            dataUrl = result;
            return App.Utils.promiseLoadImage(dataUrl);
        }).then(function(img){
            Ember.Logger.debug('img object required');
            var image = { filename: file.name, width: img.width, height: img.height };
            return Promise.all([
                _self.promiseAddData(SFM.STORE_IMAGES, image),
                App.Utils.promiseImageThumbnail(img)
            ]);
        }).then(function(results){
            Ember.Logger.debug('_id and thumbnail required');
            _id = results[0];
            var thumbnailDataUrl = results[1];
            return Promise.all([
                _self.promiseSetData(SFM.STORE_THUMBNAILS, _id, thumbnailDataUrl),
                _self.promiseSetData(SFM.STORE_FULLIMAGES, _id, dataUrl)
            ]);
        }).then(function(){
            Ember.Logger.debug('one image process finished');
            return _id;
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
                db.transaction(store, 'readwrite').objectStore(store).put(data, key).onsuccess = function(e){
                    resolve(e.target.result);
                }
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