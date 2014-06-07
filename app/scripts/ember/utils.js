'use strict';

App.Utils = {};

App.Utils.promiseImage = function(id){
    return new Promise(function(resolve, reject){
        IDBAdapter.promiseData(SFM.STORE_FULLIMAGES, id).then(function(dataURL){
            var img = document.createElement('img');
            img.onload = function(){
                resolve(img);
            };
            img.src = dataURL
        }, reject);
    });
};

App.Utils.drawFeatures = function(ctx, features, offsetX, offsetY, scale, options){
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
};