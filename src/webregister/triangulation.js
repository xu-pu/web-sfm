'use strict';

var la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

var laUtils = require('../math/la-utils.js');

/**
 *
 * @param {Matrix} P1 - projection matrix of camera 1
 * @param {Matrix} P2 - projection matrix of camera 2
 * @param {Vector} x1 - cord on camera 1
 * @param {Vector} x2 - cord on camera 2
 * @returns Vector
 */
module.exports = function(P1, P2, x1, x2){

    var x1Hat = laUtils.crossVector(x1),
        x2Hat = laUtils.crossVector(x2),
        eqSet1 = x1Hat.x(P1).elements,
        eqSet2 = x2Hat.x(P2).elements;

    var equation = Matrix.create([
        eqSet1[0],
        eqSet1[1],
        eqSet1[2],
        eqSet2[0],
        eqSet2[1],
        eqSet2[2]
    ]);

    var result = equation.svd(),
        V = result.V,
        v = V.col(4),
        X = v.x(1/ v.modulus());

    return X;

};