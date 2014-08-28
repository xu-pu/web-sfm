//==================================================

module.exports.getLocalStorage = getLocalStorage;
module.exports.setLocalStorage = setLocalStorage;
module.exports.requireImageFile = requireImageFile;
module.exports.requireJSON = requireJSON;
module.exports.promiseLoadImage = promiseLoadImage;
module.exports.getImageThumbnail = getImageThumbnail;

//==================================================

function getLocalStorage(key){
    var result = localStorage.getItem(key);
    if (result === null) {
        return null;
    }
    else {
        return JSON.parse(result);
    }
}


function setLocalStorage(key, value){
    localStorage.setItem(key, JSON.stringify(value));
}


function promiseImage(id){
    return new Promise(function(resolve, reject){
        IDBAdapter.promiseData(SFM.STORE_FULLIMAGES, id).then(function(dataURL){
            var img = document.createElement('img');
            img.onload = function(){
                resolve(img);
            };
            img.src = dataURL
        }, reject);
    });
}


function drawFeatures(ctx, features, offsetX, offsetY, scale, options){
    options = options || {};
    _.defaults(options, {
        color: 'red',
        markSize: 3
    });
    ctx.beginPath();
    ctx.strokeStyle = options.color;
    ctx.lineWidth = options.markSize/2;
    features.forEach(function(feature){
        var x = offsetX + scale*feature.col,
            y = offsetY + scale*feature.row;
        ctx.moveTo(x-options.markSize, y);
        ctx.lineTo(x+options.markSize, y);
        ctx.moveTo(x, y-options.markSize);
        ctx.lineTo(x, y+options.markSize);
    });
    ctx.stroke();
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
 * @param {File} file
 * @returns {Promise}
 */
function promiseDataUrl(file){
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
        var request = new XMLHttpRequest();
        request.responseType = 'json';
        request.onload = function(){
            resolve(request.response);
        };
        request.onerror = reject;
        request.ontimeout = reject;
        request.onabort = reject;
        request.open('GET', url);
        request.send();
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
        request.responseType = 'blob';
        request.onload = function(){
            resolve(request.response);
        };
        request.onerror = reject;
        request.ontimeout = reject;
        request.onabort = reject;
        request.open('GET', url);
        request.send();
    });
}


function requireImageFile(url){

    return promiseRetry();

    function promiseRetry(){
        return promiseImageFile(url).catch(promiseRetry);
    }

}