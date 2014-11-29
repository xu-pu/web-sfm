'use strict';

var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

//========================================================


/**
 * Get Jacobian Matrix
 * @param {function(Vector):Vector} func - f(vx) => vy
 * @param {Vector} x - start point x0[]
 * @returns {Matrix}
 */
module.exports = function(func, x){

    var DELTA = 0.1;

    var y = func(x),
        xx = x.dup(),
        xs = x.elements.length,
        ys = y.elements.length;

    var J = _.range(xs).map(function(xi){
        xx.elements[xi] = xx.elements[xi] + DELTA;
        var yy = func(xx);
        xx.elements[xi] = xx.elements[xi] - DELTA;
        return _.range(ys).map(function(yi){
            return (yy.elements[yi]-y.elements[yi])/DELTA;
        });
    });

    J = Matrix.create(J);

    return J

};