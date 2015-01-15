'use strict';

var ndarray = require('ndarray'),
    pool = require('ndarray-scratch'),
    interp = require('ndarray-linear-interpolate').d2,
    downsample = require('ndarray-downsample2x'),
    grayscale = require('luminance');

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


/**
 * x2 Supersample ndarray
 * @param img
 */
module.exports.getSupersample = function(img){

    var newRows = img.shape[0]*2, newCols = img.shape[1]*2;
    var result = pool.malloc([newRows, newCols]);

    var r,c;
    for (r=0; r<newRows; r++) {
        for (c=0; c<newCols; c++) {
            result.set(r, c, interp(img, r/2, c/2));
        }
    }

    return result;

};


/**
 * Grayscale to RGB ndarray
 * @param img
 * @returns {*}
 */
module.exports.gray2rgb = function(img){
    var width = img.shape[1],
        height = img.shape[0],
        result = pool.malloc([height, width, 3]);
    var row, col;
    for (row=0; row<height; row++) {
        for (col=0; col<width; col++) {
            result.set(row, col, 0, img.get(row, col));
            result.set(row, col, 1, img.get(row, col));
            result.set(row, col, 2, img.get(row, col));
        }
    }
    return result;
};


/**
 * Shortcut for rgb to grayscale
 * @param img
 */
module.exports.rgb2gray = function(img){
    return grayscale(img);
};