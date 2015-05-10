'use strict';

var _ = require('underscore'),
    pool = require('ndarray-scratch');

var kernels = require('../math/kernels.js');

//====================================================


/**
 *
 * @param target
 * @param source
 * @param {number} sigma
 */
exports.blur = function(target, source, sigma){

    var radius = Math.round(sigma*2),
        size = radius*2 - 1,
        center = radius-1,
        rows = target.shape[1],
        cols = target.shape[0],
        kern = kernels.getGuassianKernel(size, sigma).elements;

    var row, col, offsetR, offsetC, pixel;
    for (row=0; row<rows; row++) {
        for (col=0; col<cols; col++) {
            pixel = 0;
            for(offsetR=-center; offsetR<radius; offsetR++) {
                for(offsetC=-center; offsetC<radius; offsetC++) {
                    pixel += kern[center+offsetR][center+offsetC] * (source.get(col+offsetC, row+offsetR) || 0);
                }
            }
            target.set(col, row, pixel);
        }
    }


};


/**
 * Cache gradient information of ndarray
 * @param img
 */
exports.cacheGradient = function(img){

    var width = img.shape[0],
        height = img.shape[1],
        buffer = pool.malloc([width, height, 2]);

    var rowCursor, colCursor;
    for (rowCursor=0; rowCursor<height; rowCursor++) {
        for (colCursor=0; colCursor<width; colCursor++) {
            (function(){
                var dy = (
                        (img.get(colCursor, rowCursor+1) || img.get(colCursor, rowCursor)) -
                        (img.get(colCursor, rowCursor-1) || img.get(colCursor, rowCursor)) ) / 2,
                    dx = (
                        (img.get(colCursor+1, rowCursor) || img.get(colCursor, rowCursor)) -
                        (img.get(colCursor-1, rowCursor) || img.get(colCursor, rowCursor)) ) / 2,
                    mag = Math.sqrt(dx*dx+dy*dy),
                    rawAng = Math.atan2(dy, dx),
                    ang = rawAng < 0 ? rawAng + Math.PI*2 : rawAng;
                buffer.set(colCursor, rowCursor, 0, mag);
                buffer.set(colCursor, rowCursor, 1, ang);
            })();
        }
    }

    return buffer;

};