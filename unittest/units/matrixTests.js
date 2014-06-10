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


    describe('#svd()', function(){

        it('execute without exeption', function(){
            [matrixSample1, matrixSample2].forEach(function(sample){
                assert.doesNotThrow(function(){
                    sample.svd();
                });
            });
        });

        it('can multiply back together', function(){
            [matrixSample2, matrixSample1].forEach(function(sample){
                var result = sample.svd();
                var U = result.U,
                    V = result.V,
                    D = result.D;
                var back = U.dot(D).dot(V.transpose());
                var diff = back.sub(sample);
                assert.equal(true, diff.l2Norm()<0.00001);
            });
        });

        it('U and V are square', function(){
            [matrixSample2, matrixSample1].forEach(function(sample){
                var result = sample.svd();
                [result.U, result.V].forEach(function(m){
                    assert.equal(m.TYPE_SQUARE, m.getType());
                });
            });
        });

    });

});