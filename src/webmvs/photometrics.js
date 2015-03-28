'use strict';

var _ = require('underscore'),
    la = require('sylvester'),
    Vector = la.Vector,
    Matrix = la.Matrix,
    interp2d = require("ndarray-linear-interpolate").d2,
    interp3d = require("ndarray-linear-interpolate").d3;

var projections = require('../math/projections.js'),
    cord = require('../utils/cord.js'),
    geoUtils = require('../math/geometry-utils.js');

var settings = require('./settings.js'),
    PATCH_RADIUS = settings.PATCH_RADIUS,
    PATCH_SIZE = settings.PATCH_SIZE,
    WEIGHT = 1/(PATCH_SIZE*PATCH_SIZE);

//====================================================


/**
 * @param {Vector} center
 * @param {Vector} x - x of local cord system
 * @param {Vector} y - y of local cord system
 * @param {Matrix} P
 * @param img - 3d-ndarray image of color
 */
exports.sampleRGB = function(center, x, y, P, img){

    var rMemo = 0, gMemo = 0, bMemo = 0,
        curX, curRC, offsetX, offsetY;

    for (offsetX=0; offsetX<PATCH_RADIUS; offsetX++) {
        for (offsetY=0; offsetY<PATCH_RADIUS; offsetY++) {
            curX = cord.toHomo3D(center.add(x.x(offsetX)).add(y.x(offsetY)));
            curRC = cord.img2RC(P.x(curX));
            rMemo += WEIGHT*interp3d(img, curRC.col, curRC.row, 0);
            gMemo += WEIGHT*interp3d(img, curRC.col, curRC.row, 1);
            bMemo += WEIGHT*interp3d(img, curRC.col, curRC.row, 2);
        }
    }

    return { R: rMemo, G: gMemo, B: bMemo };

};


/**
 * Normalized Cross Correlation (NCC) score, [0,1], higher better
 * @param {PatchSample} array1
 * @param {PatchSample} array2
 * @returns {number}
 */
module.exports.ncc = function(array1, array2){

    var size = array1.length,
        row, col,
        memo= 0,
        mean = Math.sqrt(
            getSqureSum(array1) * getSqureSum(array2)
        );

    for (row=0; row<size; row++) {
        for (col=0; col<size; col++) {
            memo += array1[row][col]*array2[row][col];
        }
    }

    return memo/mean;

};


/**
 * Photometric discrepency [0,1], lower better
 * @param {PatchSample} array1
 * @param {PatchSample} array2
 * @returns {number}
 */
module.exports.discrepency = function(array1, array2){
    return 1-exports.ncc(array1, array2);
};


module.exports.refinePatch = function(){
    
};

//====================================================


/**
 * Square Sum
 * @param {number[][]} sample
 * @returns {number}
 */
function getSqureSum(sample){

    var row, col, cursor,
        size=sample.length,
        memo= 0;

    for (row=0; row<size; row++) {
        for (col=0; col<size; col++) {
            cursor = sample[row][col];
            memo += cursor*cursor;
        }
    }

    return memo;

}