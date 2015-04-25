'use strict';

var _ = require('underscore'),
    assert = require('assert'),
    Promise = require('promise'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;


var samples = require('../src/utils/samples.js'),
    jacobian = require('../src/math/jacobian.js'),
    genRamdom = require('../src/utils/random.js'),
    laUtils = require('../src/math/la-utils.js'),
    sba = require('../src/math/sparse-bundle-adjustment.js');


var ZERO = Math.pow(10, -12);


/**
 *
 * @param {Vector} x - 5D
 * @returns Vector - 3D
 */
function nonLinearFunc(x){
    return laUtils.toVector([
        x.e(1)*x.e(5)/x.e(2),
        x.e(3)*x.e(3)*x.e(4)/5,
        4*x.e(4)*x.e(4)/x.e(1)
    ]);
}


describe('sparse-bundle-adjustment', function(){

    describe('#sparseJacobian', function(){

        it('Get same result as the dense version', function(){

            var x0 = Vector.Random(5);

            var dense = jacobian(nonLinearFunc, x0);
            var sparse = laUtils.toMatrix(sba.sparseJacobian(nonLinearFunc, x0));
            var error = laUtils.matrixInfiniteNorm(dense.subtract(sparse));

            //console.log(dense);
            //console.log(sparse);
            //console.log(error);

            assert(error<ZERO);

        });

    });

});