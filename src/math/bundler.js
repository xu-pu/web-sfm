'use strict';

var la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

module.exports.world2img = world2img;
module.exports.world2RT  = worldRT;

/**
 *
 * @param X
 * @param R
 * @param t
 */
function world2perspective(X, R, t){
    return R.x(X).add(t);
}

function perspective2world(P, R, t){
    return R.transpose().x(P.subtract(t));
}

function world2img(X, R, t, focal, k1, k2, width, height){}

/**
 * @param X
 * @param R
 * @param t
 * @param focal
 * @param width
 * @param height
 * @returns {{row: number, col: *}}
 */
function worldRT(X, R, t, focal, width, height){
    var P = world2perspective(X, R, t);
    P = P.x(-focal/P.elements[2]); // perspective divide
    var x = P.elements[0], y = P.elements[1];
    return {
        row: height/2 - y,
        col: x + width/2
    };
}

/**
 * @param R
 * @param t
 */
function getCameraPosition(R, t){
    return R.transpose().x(t).x(-1);
}