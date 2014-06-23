App.StorageAdapter = function(project){
    this.project = project;
    this.connection = null;
};

App.StorageAdapter.prototype = {

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
                    this.createStores(_self.connection);
                };
                request.onsuccess = function(e){
                    _self.connection = e.target.result;
                    resolve(_self.connection);
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
        var _self = this;
        return new Promise(function(resolve, reject) {
            App.Utils.promiseDataUrl(file).then(function (dataUrl) {
                App.Utils.promiseLoadImage(dataUrl).then(function (img) {
                    _self.promiseAddData(SFM.STORE_IMAGES, {
                        filename: file.name,
                        width: img.width,
                        height: img.height
                    }).then(function (_id) {
                        App.Utils.promiseImageThumbnail(img).then(function (thumbnailDataUrl) {
                            Promise.all([
                                _self.promiseSetData(SFM.STORE_THUMBNAILS, _id, thumbnailDataUrl),
                                _self.promiseSetData(SFM.STORE_FULLIMAGES, _id, dataUrl)
                            ]).then(function () {
                                resolve(_id);
                            });
                        });
                    });
                });
            });
        });
    },


    /**
     *
     * @param store
     * @param key
     * @return {Promise}
     */
    promiseData: function(store, key){
        return new Promise(function(resolve, reject){
            this.promiseDB().then(function(db){
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
        return new Promise(function(resolve){
            this.promiseDB().then(function(db){
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
        return new Promise(function(resolve){
            this.promiseDB().then(function(db){
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