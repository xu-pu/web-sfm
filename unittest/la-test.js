'use strict';

var _ = require('underscore'),
    assert = require('assert'),
    Promise = require('promise'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;


var samples = require('../src/utils/samples.js'),
    genRamdom = require('../src/utils/random.js'),
    laUtils = require('../src/math/la-utils.js');


var ZERO = Math.pow(10, -12);


describe('Linear Algebra Utilities', function(){

    describe('#svdSolve', function(){

        it('Ax=0', function(){

            var expected = Vector.Random(8),
                equation = genRamdom.getRandomLinearEquationSet(expected),
                solve = laUtils.svdSolve(equation),
                error = laUtils.vectorInfiniteNorm(equation.x(solve)),
                errorExp = laUtils.vectorInfiniteNorm(equation.x(expected));

            assert(error < ZERO);
            assert(errorExp < ZERO);

        });

    });

});