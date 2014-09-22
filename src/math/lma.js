'use strict';

var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;


/**
 * @param {Function[]} funcs
 * @param {number[]} initials
 */
function getJacobian (funcs, initials){
    var variables = initials.length;
    var values = funcs.length;
    var result = Matrix.create({ rows: values, cols: variables });
    funcs.forEach(function(func, index){
        _.range(variables).forEach(function(xi){
            var der = partialDerivative(func, initials, xi);
            result.set(index, xi, der);
        });
    });
    return result;
}



/**
 * @param {Function} func
 * @param {number[]} initials
 * @param {number} xi
 * @return {number}
 */
function partialDerivative(func, initials, xi){
    var DELTA = 0.1;
    var neighbor = new Float32Array(initials);
    neighbor[xi] += DELTA;
    return (func(neighbor)-func(initials))/DELTA;
}


/**
 * Levenberg-Marqurdt Algorithm
 *
 * @param {function} generator
 * @param {number[]} params -- initial parameters
 * @param constrains
 * @return {number[]}
 */
function lma(params, generator, constrains){

    var func = generator(params);
    var error = constants.map(function(constrain){
        return func
    });

    return params;
}
