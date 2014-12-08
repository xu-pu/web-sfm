'use strict';

var la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;


var standardTransform = Matrix.create([
    [1, 0 , 0],
    [0 , 1, 0],
    [0 , 0 , -1]
]);


/**
 * Convert bundler cord system to websfm cord system
 * bundler used right hand cord system, websfm used left hand
 * @param {Matrix} R
 * @param {Vector} t
 * @returns {{R: Matrix, t: Matrix}}
 */
module.exports.getStandardRt = function(R ,t){
    return {
        R: standardTransform.x(R),
        t: standardTransform.x(t)
    };
};