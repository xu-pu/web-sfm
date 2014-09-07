'use strict';

var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector,
    numeric = require('numeric');

/**
 * Construct a Guassian kernel with specific radius
 * @param size
 * @param {number} sigma
 */
module.exports = function(size, sigma) {
    var kernel = Matrix.Zero(size, size);
    var x, y, centerX=size/2, centerY=size/2;
    for (x=0; x<=size; x++) {
        for (y=0; y<=size; y++) {
            kernel.elements[y][x] = gussianFunction2d(x-centerX, y-centerY, sigma);
        }
    }
    return kernel;
};

function gussianFunction2d(x,y,sigma){
    return Math.exp(-(x*x+y*y)/(2*sigma*sigma))/(2*Math.PI*sigma*sigma);
}