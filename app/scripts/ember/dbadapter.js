'use strict';

var IDBAdapter = (function(){

    var project = 'test';

    var connection = null;

    function promiseDB(){
        return new Ember.RSVP.Promise(function(resolve, reject){
            if (connection) {
                resolve(connection);
            }
            else {
                var request = indexedDB.open(project, 3);
                request.onupgradeneeded = function(e){
                    console.log('upgrade');
                    connection = e.target.result;
                    createStores(connection);
                };
                request.onsuccess = function(e){
                    connection = e.target.result;
                    resolve(connection);
                };
            }
        });
    }


    /**
     * @param {IDBDatabase} db
     */
    function createStores(db){
        console.log('create');
        db.createObjectStore('images', { autoIncrement: true }) // image information
            .createIndex('filename', 'filename', { unique: true });
        db.createObjectStore('fullimages'); // dataURL string of the full-size image
        db.createObjectStore('thumbnails'); // dataURL string of thumnail
        db.createObjectStore('cameras');    // camera parameters
        db.createObjectStore('features');   // feature of each image
        db.createObjectStore('sparse'); // sparse point cloud
        db.createObjectStore('dense');  // dense point cloud
    }


    /**
     *
     * @param {File} file
     * @return {Ember.RSVP.Promise}
     */
    function processImageFile(file){
        return new Ember.RSVP.Promise(function(resolve, reject){
            var reader = new FileReader();
            reader.onload = function(){
                var img = document.createElement('img');
                img.onload = function(){
                    var trans = connection.transaction(['images', 'fullimages', 'thumbnails'], 'readwrite');
                    trans.objectStore('images').add({
                        filename: file.name,
                        width: img.width,
                        height: img.height
                    }).onsuccess = function(e){
                        var _id = e.target.result;
                        trans.objectStore('fullimages').add(reader.result, _id).onsuccess = function(){
                            var canvas = document.createElement('canvas');
                            var ctx = canvas.getContext('2d');
                            var aspectRatio = img.width/img.height;
                            canvas.width = 200;
                            canvas.height = 200;
                            if (aspectRatio > 1) {
                                ctx.drawImage(img, 0, 0, 200*aspectRatio, 200);
                            }
                            else {
                                ctx.drawImage(img, 0, 0, 200, 200*aspectRatio);
                            }
                            trans.objectStore('thumbnails').add(canvas.toDataURL(), _id).onsuccess = function(){
                                resolve(_id);
                            }
                        }
                    };
                };
                img.src = reader.result;
            };
            reader.readAsDataURL(file);
        });

    }


    /**
     *
     * @param store
     * @param key
     * @return {Ember.RSVP.Promise}
     */
    function promiseData(store, key){
        return new Ember.RSVP.Promise(function(resolve, reject){
            promiseDB().then(function(db){
                db.transaction(store).objectStore(store).get(key).onsuccess = function(e){
                    resolve(e.target.result);
                };
            });
        });
    }


    function promiseSetData(store, key, data){
        return new Ember.RSVP.Promise(function(resolve, reject){
            promiseDB().then(function(db){
                db.transaction(store, 'readwrite').objectStore(store).add(data, key).onsuccess = function(e){
                    resolve(e.target.result);
                }
            });
        });
    }


    function queryEach(name, callback, terminate){
        promiseDB().then(function(db){
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

    function switchProject(name){
        project = name;
        connection = null;
    }

    return {
        promiseDB: promiseDB,
        promiseData: promiseData,
        promiseSetData: promiseSetData,
        queryEach: queryEach,
        createStores: createStores,
        processImageFile: processImageFile,
        switchProject: switchProject
    };

}());