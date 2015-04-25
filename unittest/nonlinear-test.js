'use strict';

var _ = require('underscore'),
    assert = require('assert'),
    Promise = require('promise'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;


var samples = require('../src/utils/samples.js'),
    genRamdom = require('../src/utils/random.js'),
    laUtils = require('../src/math/la-utils.js'),
    nonlinear = require('../src/math/nonlinear.js');


var ZERO = Math.pow(10, -12);


/**
 *
 * @param {Vector} x - 5D
 * @returns Vector - 3D
 */
function nonLinearFunc(x){
    return laUtils.toVector([
        x.e(1)*x.e(2),
        x.e(3)*x.e(4),
        x.e(4)*x.e(5)
    ]);
}


describe('nonlinear', function(){

    describe('#sparseJacobian', function(){

        it('Get same result as the dense version', function(){

            var x0 = Vector.Random(5);

            var dense = nonlinear.jacobian(nonLinearFunc, x0);
            var sparse = laUtils.toMatrix(nonlinear.sparseJacobian(nonLinearFunc, x0));
            var error = laUtils.matrixInfiniteNorm(dense.subtract(sparse));

            //console.log(dense);
            //console.log(sparse);
            //console.log(error);

            assert(error<ZERO);

        });

    });

    describe('#lma', function(){

        var xx = laUtils.toVector([10,12,13,23,10]);
        var targetY = nonLinearFunc(xx);
        var step = Vector.Random(5);
        var x0 = xx.add(step);
        var refinedX = nonlinear.lma(nonLinearFunc, x0, targetY);
        var refinedY = nonLinearFunc(refinedX);

/*
        it('|| xx - refinedX || == 0', function(){
            var error = laUtils.vectorInfiniteNorm(xx.subtract(refinedX));
            console.log(error);
            assert(error<ZERO);
        });
*/

        it('|| targetY - refinedY || == 0', function(){
            var error = laUtils.vectorInfiniteNorm(targetY.subtract(refinedY));
            assert(error<ZERO);
        });

    });

});