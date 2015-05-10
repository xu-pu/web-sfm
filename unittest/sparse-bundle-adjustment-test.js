'use strict';

var assert = require('assert');

var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

var laUtils = require('../src/math/la-utils.js'),
    genUtils = require('../src/utils/random-test-utils.js'),
    sba = require('../src/webregister/sparse-bundle-adjustment.js'),
    sparse = require('../src/math/sparse-matrix.js'),
    SparseMatrix = sparse.SparseMatrix;

var ZERO = Math.pow(10, -12);
var CAM_PARAMS = 11;
var POINT_PARAMS = 3;

describe('sparse-bundle-adjustment', function(){

    describe('#solveHessian', function(){

        function getError(cams, points){
            var N = genUtils.genSBAMatrix(cams,points);
            var g = Vector.Random(CAM_PARAMS*cams+POINT_PARAMS*points);
            var delta = sba.solveHessian(N, g, cams, points);
            var sparseG = N.x(SparseMatrix.fromDenseVector(delta.elements));
            var gg = laUtils.toVector(sparseG);
            return laUtils.vectorInfiniteNorm(gg.subtract(g));
        }

        it('N dot delta == g', function(){
            var error = getError(3, 10);
            console.log(error);
            assert(error < Math.pow(10, -10));
        });

        it('Works when only have points, no camera', function(){
            var error = getError(0, 20);
            console.log(error);
            assert(error < Math.pow(10, -10));
        });

        it('Works when only have cameras, no points', function(){
            var error = getError(3, 0);
            console.log(error);
            assert(error < Math.pow(10, -10));
        });

    });

});