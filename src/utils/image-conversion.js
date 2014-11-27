'use strict';

var ndarray = require('ndarray');

//======================================================


/**
 * Convert ImageData to ndarray
 * @param {ImageData} imagedata
 */
module.exports.imagedata2ndarray = function(imagedata){
    return ndarray(imagedata.data, [imagedata.height, imagedata.width, 4]);
};


/**
 *
 * @param ctx
 * @param {int} width
 * @param {int} height
 */
module.exports.canvas2ndarray = function(ctx, width, height){
    var imagedata = ctx.getImageData(0, 0, width, height);
    return exports.imagedata2ndarray(imagedata);
};