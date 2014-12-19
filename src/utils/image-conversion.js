'use strict';

var ndarray = require('ndarray'),
    pool = require('ndarray-scratch'),
    downsample = require('ndarray-downsample2x');

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


/**
 * Downsample ndarray
 * @param img
 */
module.exports.getDownsample = function(img){
    var result = pool.malloc(img.step(2,2).shape);
    downsample(result, img, 0, 255);
    return result;
};