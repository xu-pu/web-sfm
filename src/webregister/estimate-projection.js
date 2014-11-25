'use strict';

var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

var cord = require('../utils/cord.js'),
    laUtils = require('../math/la-utils.js');


/**
 * Estimate projection matrix from imgCord/3dCord pairs
 * @param {{X, x}[]} dataset
 */
module.exports = function(dataset){

    var A = [];

    dataset.forEach(function(pair){

        var X = pair.X,
            x = pair.x,
            XX = Matrix.create([X.elements]);

        laUtils.crossVector(x).elements.forEach(function(skewed){
            var xx = Matrix.create(skewed),
                coeM = xx.x(XX),
                coeV = _.flatten(coeM.elements);
            A.push(coeV);
        });

    });

    var results = Matrix.create(A).svd(),
        V = results.V,
        v = V.col(12),
        normalizedV = v.x(1/v.modulus()),
        result = normalizedV.elements;

    return Matrix.create([
        result.slice(0, 4),
        result.slice(4, 8),
        result.slice(8, 12)
    ]);

};