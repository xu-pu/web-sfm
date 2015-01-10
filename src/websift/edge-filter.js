'use strict';

var la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

var settings = require('./settings.js'),
    derivatives = require('../math/derivatives.js'),
    dxx = derivatives.dxx,
    dyy = derivatives.dyy,
    dxy = derivatives.dxy,
    dyx = derivatives.dyx;

var CURVATURE_THRESHOLD = settings.EDGE_CURVATURE_THRESHOLD;

//===================================================================


/**
 * isNotEdge
 * @param {Scale} scale
 * @param {DetectedFeature} f
 * @returns {Boolean}
 */
module.exports = function(scale, f) {

    var row = f.row,
        col = f.col,
        img = scale.img,
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
        return tr*tr/det < CURVATURE_THRESHOLD;
    }

};