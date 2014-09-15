'use strict';

var la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

module.exports.world2img = world2img;

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

function world2img(X, R, t, focal){
    var P = world2perspective(X, R, t);
    return P.x(-focal/P.elements[2]);
}

/**
 * @param R
 * @param t
 */
function getCameraPosition(R, t){
    return R.transpose().x(t).x(-1);
}