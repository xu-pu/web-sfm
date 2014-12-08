'use strict';

var pool = require('ndarray-scratch'),
    la = require('sylvester'),
    Vector = la.Vector,
    Matrix = la.Matrix;

var cord = require('../utils/cord.js');

//==================================================


/**
 * Get homography of image in ndarray
 * @param img - ndarray
 * @param H
 * @param {boolean} centered
 */
module.exports = function(img, H, centered){
    var width = img.shape[1],
        height = img.shape[0],
        cam = { width: width, height: height },
        buffer = pool.zeros(img.shape),
        pointH = module.exports.pointHomography;
    if (centered) {
        pointH = centeredHomography(H, cam);
    }
    var row, col, mapped;
    for(row=0; row<height; row++){
        for(col=0; col<width; col++){
            mapped = pointH(row, col, H, cam);
            if (mapped) {
                buffer.set(mapped[0], mapped[1], img.get(row, col));
            }
        }
    }
    return buffer;
};


/**
 *
 * @param {number} r
 * @param {number} c
 * @param H
 * @param {Camera} cam
 * @returns {null|int[]}
 */
module.exports.pointHomography = function pointHomography(r, c, H, cam){
    var rt = cord.img2RC(H.x(Vector.create(cord.rc2img(r, c))));
    var col = Math.floor(Math.floor(rt.col)),
        row = Math.floor(Math.floor(rt.row));
    if (row >=0 && row<cam.height && col>=0 && col<cam.width) {
        return [row, col];
    }
    else {
        return null;
    }
};


//==================================================


/**
 *
 * @param H
 * @param {Camera} cam
 * @returns {Function}
 */
function centeredHomography(H, cam){

    var rt = cord.img2RC(H.x(Vector.create([cam.width / 2, cam.height / 2, 1]))),
        offsetRow = cam.height/2 - rt.row,
        offsetCol = cam.width/2 - rt.col;

    return function(r, c, H, cam){
        var rt = cord.img2RC(H.x(Vector.create(cord.rc2img(r, c))));
        var col = Math.floor(Math.floor(rt.col+offsetCol)),
            row = Math.floor(Math.floor(rt.row+offsetRow));
        if (row >=0 && row<cam.height && col>=0 && col<cam.width) {
            return [row, col];
        }
        else {
            return null;
        }
    };
}