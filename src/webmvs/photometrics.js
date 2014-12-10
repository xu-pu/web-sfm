'use strict';

var _ = require('underscore'),
    la = require('sylvester'),
    Vector = la.Vector,
    Matrix = la.Matrix,
    interp = require("ndarray-linear-interpolate").d2;

var cord = require('../utils/cord.js'),
    geoUtils = require('../math/geometry-utils.js');

//====================================================


/**
 * Normalized Cross Correlation (NCC) score, [0,1], higher better
 * @param {number[][]} array1
 * @param {number[][]} array2
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
 * @param {number[][]} array1
 * @param {number[][]} array2
 * @returns {number}
 */
module.exports.discrepency = function(array1, array2){
    return 1-exports.ncc(array1, array2);
};


/**
 *
 * @param {ImageCellGrid[]} imgs
 * @param {Patch} p
 * @param {int} mu
 * @returns {PatchSample[]}
 */
module.exports.samplePatch = function(imgs, p, mu){

    var T = c,
        R = geoUtils.getRotationFromEuler(n[0], n[1], n[2]),
        RR = R.transpose(),
        offset = mu/2;

    var samplePoints = _.range(mu).map(function(row){
        return _.range(mu).map(function(col){
            return RR.x(Vector.create([col-offset, row-offset, 0])).add(T);
        });
    });

    return imgs.map(function(img){
        var projector = img.cam.P;
        return _.range(mu).map(function(row) {
            return _.range(mu).map(function (col) {
                var imgP = projector.x(samplePoints[row][col]);
                var rc = cord.img2RC(imgP);
                return interp(img.img, rc.col, rc.row);
            });
        });
    })

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