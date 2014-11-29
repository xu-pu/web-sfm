'use strict';

var la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;


/**
 * get skewed matrix equivalent as cross product
 * @param v - 3d vector
 */
module.exports.crossVector = function(v){
    return Matrix.create([
        [ 0      , -v.e(3) , v.e(2) ],
        [ v.e(3) , 0       , -v.e(1)],
        [ -v.e(2), v.e(1)  , 0      ]
    ]);
};


/**
 * max of abs
 * @param {Matrix} m
 * @returns number
 */
module.exports.matrixInfiniteNorm = function(m){};


/**
 * max of abs
 * @param {Vector} v
 * @returns number
 */
module.exports.vectorInfiniteNorm = function(v){};