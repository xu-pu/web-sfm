'use strict';

var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector,
    numeric = require('numeric'),
    cord = require('../utils/cord.js');


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

        [
            [  0      ,  x.e(3) , -x.e(2) ],
            [ -x.e(3) ,  0      ,  x.e(1) ],
            [  x.e(2) , -x.e(1) ,  0      ]
        ].forEach(function(skewed){
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