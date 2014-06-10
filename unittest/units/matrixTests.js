'use strict';

var assert = require("assert");
var SFM = require("../../build/scripts/sfmunittest.js");
var _ = require("../../venders/underscore/underscore.js");

describe('SFM.Matrix class', function(){

    var matrixSample1 = new SFM.M([
        [2,3,14],
        [2,5,6],
        [4,32,7],
        [8,1,7,9]
    ]);


    var matrixSample2 = new SFM.M([
        [2,3,14],
        [2,5,6],
        [4,32,7]
    ]);

    var matrixSolvable1 = new SFM.M([
        [1,0,1],
        [0,1,1],
        [2,1,1],
        [0,2,1],
    ]);

    describe('#svd()', function(){

        [matrixSample1, matrixSample2].forEach(function(sample){

            var result;

            it('execute without exeption', function(){
                assert.doesNotThrow(function(){
                    result = sample.svd();
                });
            });

            it('can multiply back together', function(){
                var U = result.U,
                    V = result.V,
                    D = result.D;
                var back = U.dot(D).dot(V.transpose());
                var diff = back.sub(sample);
                assert.equal(true, diff.l2Norm()<0.00001);
            });

            it('U and V are square', function(){
                [result.U, result.V].forEach(function(m){
                    assert.equal(m.TYPE_SQUARE, m.getType());
                });
            });

            it('is orthoganal', function(){
                [result.u, result.v].forEach(function(m){
                    var ma = SFM.M(m);
                    var vectors = ma.getNativeCols().map(function(col){
                        return SFM.C(col);
                    });
                    vectors.forEach(function(v1, i1){
                        vectors.forEach(function(v2, i2){
                            var product = v1.transpose().dot(v2);
                            if (i1 === i2) {
                                assert.equal(true, Math.pow(product-1, 2)<0.1);
                            }
                            else {
                                assert.equal(true, Math.pow(product, 2)<0.1);
                            }
                        });
                    });
                });
            });

        });

    });

    describe('#svdSolve()', function(){
        [matrixSolvable1, matrixSample2].forEach(function(sample){

            var solve;

            it('executed without exceptions', function(){
                assert.doesNotThrow(function(){
                    solve = sample.svdSolve();
                });
            });

            it('have correct dimension', function(){
                assert.equal(solve.TYPE_VECTOR, solve.getType());
            });

            /*
            it('solves the equation', function(){
                var diff = sample.dot(solve).l2Norm();
                console.log('solve');
                console.log(diff);
            });
            */

        });
    });

});