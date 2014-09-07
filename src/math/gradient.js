'use strict';

var interp = require("ndarray-linear-interpolate").d2;

var SOBEL_X = require('./kernels.js').sobelX,
    SOBEL_Y = require('./kernels.js').sobelY;

/**
 * @typedef {{dir:number, mag:number}} Gradient
 */


/**
 * @param img
 * @param row
 * @param col
 * @return Gradient
 */
module.exports = function(img, row, col){
    var gradientX = convolution(img, row, col, SOBEL_X),
        gradientY = convolution(img, row, col, SOBEL_Y);
    return {
        dir: Math.atan2(gradientY, gradientX),
        mag: Math.sqrt(Math.pow(gradientX,2)+Math.pow(gradientY,2))
    };
};

function convolution(img, row, col, kernel){
    var result = 0,
        iterRow,iterCol;
    for (iterRow=-1; iterRow<=1; iterRow++) {
        for (iterCol=-1; iterCol<=1; iterCol++) {
            result += kernel.elements[1+iterRow][1+iterCol] * interp(img, row+iterRow, col+iterCol);
        }
    }
    return result;
}