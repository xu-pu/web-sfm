'use strict';


var la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

var derivatives = require('../math/derivatives.js'),
    dxx = derivatives.dxx,
    dyy = derivatives.dyy,
    dxy = derivatives.dxy,
    dyx = derivatives.dyx;

var r = 10,
    threshold = Math.pow(r+1, 2)/r;

/**
 * isNotEdge
 * @param {DoG} dog
 * @param {Number} row
 * @param {Number} col
 * @returns {Boolean}
 */
module.exports = function(dog, row, col) {

    var img = dog.img,
        H = Matrix.create([
            [ dxx(img, row, col), dxy(img, row, col) ],
            [ dyx(img, row, col), dyy(img, row, col) ]
        ]),
        det = H.det(),
        tr = H.e(1,1) + H.e(2,2);
    if (det < 0) {
        // det of H is unlikely to be negative, if so, discard the point as edge
        return true;
    }
    else {
        return tr*tr/det < threshold;
    }
};