'use strict';

var assert = require('assert');

var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;


var laUtils = require('../src/math/la-utils.js'),
    sparse = require('../src/math/sparse-matrix.js'),
    SparseMatrix = sparse.SparseMatrix;

var ZERO = Math.pow(10, -12);

describe('SparseMatrix', function(){

    describe('#fromBlockDiag', function(){

        it('Block diag inverse', function(){

            var ms = _.range(5).map(function(){
                    return Matrix.Random(3,3);
                }),
                invms = ms.map(function(m){
                    return m.inverse();
                });

            var diag1 = SparseMatrix.fromBlockDiag(ms.map(function(m){ return m.elements; })),
                diag2 = SparseMatrix.fromBlockDiag(invms.map(function(m){ return m.elements; }));

            var result = diag1.x(diag2),
                denseResult = laUtils.toMatrix(result),
                errorMatrix = denseResult.subtract(Matrix.I(result.rows)),
                error = laUtils.matrixInfiniteNorm(errorMatrix);

            console.log(error);

            assert(error<ZERO);

        });

    });

    describe('#toDense', function(){

        it('dense and sparse have same dimensions (vector)', function(){

            var arr = [1,1,1,0,0,0];
            var sparse = SparseMatrix.fromDenseVector(arr);
            var dense = sparse.toDenseVector();
            assert(dense.length === arr.length);

        });

        it('dense and sparse have same dimensions (matrix)', function(){

            var arr = [
                [1,2,0],
                [3,4,0],
                [0,0,0],
                [0,0,0]
            ];
            var sparse = SparseMatrix.fromDense(arr);
            var dense = sparse.toDense();
            assert(arr.length === dense.length);
            assert(arr[0].length === dense[0].length);
        });


    });


});