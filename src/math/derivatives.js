'use strict';

var interp = require("ndarray-linear-interpolate").d2;

module.exports.dx = dx;
module.exports.dy = dy;
module.exports.dxx = dxx;
module.exports.dyy = dyy;
module.exports.dxy = dxy;
module.exports.dyx = dyx;
module.exports.gradient = gradient;


function dx(img, row, col){
    return interp(img, row, col+1) - interp(img, row, col);
}

function dy(img, row, col){
    return interp(img, row+1, col) - interp(img, row, col);
}

function dxx(img, row, col){
    return dx(img, row, col) - dx(img, row, col-1);
}

function dyy(img, row, col){
    return dy(img, row, col) - dy(img, row-1, col);
}

function dxy(img, row, col){
    return dx(img, row, col) - dx(img, row-1, col);
}

function dyx(img, row, col){
    return dy(img, row, col) - dy(img, row, col-1);
}


/**
 * @typedef {{dir:number, mag:number}} Gradient
 */

/**
 * @param img
 * @param row
 * @param col
 * @returns {Gradient}
 */
function gradient(img, row, col){
    var gdx = dx(img, row, col),
        gdy = dy(img, row, col);
    return {
        dir: Math.atan2(gdy, gdx),
        mag: Math.sqrt( gdx*gdx + gdy*gdy )
    };
}