'use strict';

var pool = require('ndarray-scratch'),
    Vector = require('sylvester').Vector;

var cord = require('../utils/cord.js');

module.exports = homography;
module.exports.pointHomography = pointHomography;


function homography(img, H, centered){
    var width = img.shape[1],
        height = img.shape[0],
        cam = { width: width, height: height },
        buffer = pool.zeros(img.shape),
        pointH = pointHomography;
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
}

function centeredHomography(H, cam){

    var rt = cord.img2RT(H.x(Vector.create([cam.width/2, cam.height/2, 1])), cam.height),
        offsetRow = cam.height/2 - rt.row,
        offsetCol = cam.width/2 - rt.col;

    return function(r, c, H, cam){
        var rt = cord.img2RT(H.x(Vector.create(cord.RCtoImg(r, c, cam))), cam.height);
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

function pointHomography(r, c, H, cam){
    var rt = cord.img2RT(H.x(Vector.create(cord.RCtoImg(r, c, cam))), cam.height);
    var col = Math.floor(Math.floor(rt.col)),
        row = Math.floor(Math.floor(rt.row));
    if (row >=0 && row<cam.height && col>=0 && col<cam.width) {
        return [row, col];
    }
    else {
        return null;
    }
}