'use strict';

var _ = require('underscore');

//==================================================


/**
 * @param {string} url
 * @param {string} datatype
 * @returns Promise
 */
module.exports.promiseDownload = function(url, datatype){
    return new Promise(function(resolve, reject){
        var request = new XMLHttpRequest();
        request.open('GET', url);
        request.onload = function(){
            resolve(request.response);
        };
        request.onerror = reject;
        request.ontimeout = reject;
        request.onabort = reject;
        request.responseType = datatype;
        request.send();
    });
};


/**
 *
 * @returns {number}
 */
module.exports.getUUID = function(){
    return (new Date()).getTime();
};


/**
 *
 * @param {Blob} blob
 * @returns {Promise}
 */
module.exports.promiseBlob = function(blob){
    return new Promise(function(resolve, reject){
        var reader = new FileReader();
        reader.onload = function(){
            resolve(reader.result);
        };
        reader.readAsText(blob);
    });
};


/**
 *
 * @param key
 */
module.exports.getLocalStorage = function(key){
    var result = localStorage.getItem(key);
    if (result === null || result === undefined) {
        return null;
    }
    else {
        return JSON.parse(result);
    }
};


/**
 *
 * @param key
 * @param {Object} value
 */
module.exports.setLocalStorage = function(key, value){
    localStorage.setItem(key, JSON.stringify(value));
};


/**
 *
 * @param {File|Blob} file
 * @returns {Promise}
 */
module.exports.promiseFileBuffer = function(file){
    return new Promise(function(resolve, reject){
        var reader = new FileReader();
        reader.onload = function(){
            resolve(reader.result);
        };
        reader.readAsArrayBuffer(file);
    });
};


/**
 *
 * @param url
 * @returns {Promise}
 */
module.exports.promiseLoadImage = function(url){
    return new Promise(function(resolve, reject){
        var img = document.createElement('img');
        img.onload = function(){
            resolve(img);
        };
        img.onerror = reject;
        img.ontimeout = reject;
        img.onabort = reject;
        img.src = url;
    });
};


/**
 *
 * @param {ArrayBuffer} buffer
 * @returns {Promise}
 */
module.exports.promiseBufferImage = function(buffer){
    var blob = new Blob([buffer]);
    var domstring = URL.createObjectURL(blob);
    return exports.promiseLoadImage(domstring);
};


/**
 *
 * @param {File} file
 * @returns {Promise}
 */
module.exports.promiseFileDataUrl = function(file){
    return new Promise(function(resolve, reject){
        var reader = new FileReader();
        reader.onload = function(){
                resolve(reader.result);
        };
        reader.readAsDataURL(file);
    });
};


/**
 *
 * @param {Image} img
 * @returns {string}
 */
module.exports.getImageThumbnail = function(img){
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
    return canvas.toDataURL();
};


/**
 *
 * @param {string} url
 * @returns {Promise}
 */
module.exports.promiseJSON = function(url){
    return new Promise(function(resolve, reject){
        jQuery.ajax({
            url: url,
            dataType: 'json'
        }).done(resolve).fail(reject);
    });
};


/**
 *
 * @param {string} url
 * @returns {Promise}
 */
module.exports.requireJSON = function(url){

    return promiseRetry();

    function promiseRetry(){
        return exports.promiseJSON(url).catch(promiseRetry);
    }

};


/**
 *
 * @param {string} url
 * @returns {Promise}
 */
module.exports.requireImageFile = function(url){

    return promiseRetry();

    function promiseRetry(){
        return exports.promiseImageFile(url).catch(promiseRetry);
    }

};


/**
 *
 * @param {string} url
 * @returns {Promise}
 */
module.exports.promiseImageFile = function(url){
    return new Promise(function(resolve, reject){
        var request = new XMLHttpRequest();
        request.open('GET', url);
        request.onload = function(){
            resolve(request.response);
        };
        request.onerror = reject;
        request.ontimeout = reject;
        request.onabort = reject;
        request.responseType = 'blob';
        request.send();
    });
};


/**
 * Load the script and return a dataurl of the loaded file
 * @param {string} path
 */
module.exports.promiseScript = function(path){};


/**
 *
 * @param {int} t
 * @returns {Promise}
 */
module.exports.promiseDelay = function(t){
    return new Promise(function(resolve, reject){
        _.delay(function(){
            resolve();
        }, t)
    });
};