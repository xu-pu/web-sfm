'use strict';

var pool = require('ndarray-scratch'),
    Vector = require('sylvester').Vector;

var cord = require('../utils/cord.js');

module.exports = homography;
module.exports.pointHomography = pointHomography;


function homography(img, H){
    var width = img.shape[1],
        height = img.shape[0],
        cam = { width: width, height: height },
        buffer = pool.zeros(img.shape);
    var row, col, mapped;
    for(row=0; row<height; row++){
        for(col=0; col<width; col++){
            mapped = pointHomography(row, col, H, cam);
            if (mapped) {
                buffer.set(mapped[0], mapped[1], img.get(row, col));
            }
        }
    }
    return buffer;
}


function pointHomography(r, c, H, cam){
    var rt = cord.img2RT(H.x(Vector.create(cord.RCtoImg(r, c, cam))), cam.height);
    var col = Math.floor(Math.floor(rt.col)),
        row = Math.floor(Math.floor(rt.row));
    if (row<cam.height && col<cam.width) {
        return [row, col];
    }
    else {
        return null;
    }
}