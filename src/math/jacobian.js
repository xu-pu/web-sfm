'use strict';

var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

//========================================================


/**
 * Get Jacobian Matrix
 * @param {function(Vector):Vector} func - f(vx) => vy
 * @param {Vector} x
 * @returns Matrix
 */
module.exports = function(func, x){

    var DELTA = 0.1;

    var y = func(x),
        xx = x.dup(),
        xs = x.elements.length,
        ys = y.elements.length,
        jacobian = Matrix.Zero(ys,xs),
        yNew, xi, yi;

    for (xi=0; xi<xs; xi++) {
        xx.elements[xi] = xx.elements[xi] + DELTA;
        yNew = func(xx);
        xx.elements[xi] = xx.elements[xi] - DELTA;
        for (yi=0; yi<ys; yi++) {
            jacobian.elements[yi][xi] = (yNew.elements[yi] - y.elements[yi]) / DELTA;
        }
    }

    return jacobian;

};