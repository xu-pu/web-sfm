'use strict';

var la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

//=================================================================

module.exports.sobelX = Matrix.create([
    [-1,0,1],
    [-2,0,2],
    [-1,0,1]
]);

module.exports.sobelY = Matrix.create([
    [ 1, 2, 1],
    [ 0, 0, 0],
    [-1,-2,-1]
]);

//=================================================================


/**
 * @param {number} x
 * @param {number} y
 * @param {number} sigma
 * @returns {number}
 */
module.exports.guassian2d = function(x, y, sigma){
    var sig2 = 2*sigma*sigma;
    return Math.exp(-(x*x+y*y)/sig2)/(Math.PI*sig2);
};


/**
 * @param {number} sigma
 * @returns {Function}
 */
module.exports.getGuassian2d = function(sigma){

    var factor = 2*Math.PI*sigma*sigma,
        base = 2*sigma*sigma;

    return function(x, y){
        return Math.exp(-(x*x+y*y)/base)/factor;
    };

};


/**
 * Construct a Guassian kernel with specific radius
 * @param {int} size
 * @param {number} sigma
 * @returns {Matrix}
 */
module.exports.getGuassianKernel = function(size, sigma) {

    var kernel = Matrix.Zero(size, size),
        center=(size-1)/2,
        x, y, norm = 0;

    for (x=0; x<size; x++) {
        for (y=0; y<size; y++) {
            kernel.elements[y][x] = exports.guassian2d(x-center, y-center, sigma);
            norm += kernel.elements[y][x];
        }
    }

    return kernel.x(1/norm);

};