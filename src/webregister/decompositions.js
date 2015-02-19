'use strict';

var _ = require('underscore'),
    numeric = require('numeric'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

var projections = require('../math/projections.js'),
    testUtils = require('../utils/testing.js'),
    laUtils = require('../math/la-utils.js'),
    cord = require('../utils/cord.js');


/**
 * Decompose essential matrix to Rt candidates
 * @param {Matrix} E
 * @returns {{ta: Vector, tb: Vector, Ra: Matrix, Rb: Matrix}}
 */
module.exports.ematrix2Rt = function(E){

    var D = Matrix.create([
        [  0, 1, 0 ],
        [ -1, 0, 0 ],
        [  0, 0, 1 ]
    ]);

    var usv = laUtils.svd(E),
        U = usv.U,
        V = usv.V,
        S = usv.S;

    if (U.det()<0 || V.det()<0 || S.e(1)<0 || S.e(2)<0) {
        usv = laUtils.svd(E.x(-1));
        U = usv.U;
        V = usv.V;
        S = usv.S;
    }

    if (U.det()<0 || V.det()<0 || S.e(1)<0 || S.e(2)<0) {
        throw "Essential matrix invalid";
    }

    console.log(U.det());
    console.log(V.det());
    console.log(S);

    var ta = V.col(3).toUnitVector(),
        tb = ta.x(-1),
        Ra = V.x(D).x(U.transpose()),
        Rb = V.x(D.transpose()).x(U.transpose());

    return {
        ta: ta, tb: tb,
        Ra: Ra, Rb: Rb
    };

};