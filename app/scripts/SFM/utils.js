SFM.Utils = {};

SFM.Utils.promiseImageData = function(img){
    return new Promise(function(resolve, reject){
        var canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(ctx.getImageData(0, 0, img.width, img.height));
    });
};

SFM.Utils.promiseImg = function(url){
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