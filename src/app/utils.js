'use strict';

//==================================================

module.exports.getLocalStorage = getLocalStorage;
module.exports.setLocalStorage = setLocalStorage;
module.exports.requireImageFile = requireImageFile;
module.exports.requireJSON = requireJSON;
module.exports.promiseJSON = promiseJSON;
module.exports.promiseLoadImage = promiseLoadImage;
module.exports.getImageThumbnail = getImageThumbnail;
module.exports.promiseFileDataUrl = promiseFileDataUrl;
module.exports.promiseFileBuffer = promiseFileBuffer;
module.exports.promiseBufferImage = promiseBufferImage;

//==================================================

module.exports.promiseBlob = function(blob){
    return new Promise(function(resolve, reject){
        var reader = new FileReader();
        reader.onload = function(){
            resolve(reader.result);
        };
        reader.readAsText(blob);
    });
};

//==================================================

function getLocalStorage(key){
    var result = localStorage.getItem(key);
    if (result === null || result === undefined) {
        return null;
    }
    else {
        return JSON.parse(result);
    }
}


function setLocalStorage(key, value){
    localStorage.setItem(key, JSON.stringify(value));
}


function promiseFileBuffer(file){
    return new Promise(function(resolve, reject){
        var reader = new FileReader();
        reader.onload = function(){
            resolve(reader.result);
        };
        reader.readAsArrayBuffer(file);
    });
}


/**
 *
 * @param url
 * @returns {Promise}
 */
function promiseLoadImage(url){
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
}

/**
 *
 * @param buffer
 * @returns Promise
 */
function promiseBufferImage(buffer){
    var blob = new Blob([buffer]);
    var domstring = URL.createObjectURL(blob);
    return promiseLoadImage(domstring);
}


/**
 *
 * @param {File} file
 * @returns {Promise}
 */
function promiseFileDataUrl(file){
    return new Promise(function(resolve, reject){
        var reader = new FileReader();
        reader.onload = function(){
                resolve(reader.result);
        };
        reader.readAsDataURL(file);
    });
}


/**
 *
 * @param {Image} img
 * @returns {String}
 */
function getImageThumbnail(img){
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
}


function promiseJSON(url){
    return new Promise(function(resolve, reject){
        jQuery.ajax({
            url: url,
            dataType: 'json'
        }).done(resolve).fail(reject);
    });
}


function requireJSON(url){

    return promiseRetry();

    function promiseRetry(){
        return promiseJSON(url).catch(promiseRetry);
    }

}


function promiseImageFile(url){
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
}


function requireImageFile(url){

    return promiseRetry();

    function promiseRetry(){
        return promiseImageFile(url).catch(promiseRetry);
    }

}