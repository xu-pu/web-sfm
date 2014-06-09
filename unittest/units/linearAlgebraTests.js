'use strict';

var assert = require("assert");
var SFM = require("../../build/scripts/sfmunittest.js");
var _ = require("../../venders/underscore/underscore.js");

describe('Linear algebra utilities', function(){

    describe('SFM.M()', function(){
        it('generate Matrix from 2D array', function(){
            var sobelY = SFM.M(SFM.SOBEL_KERNEL_Y);
            assert.equal(3, sobelY.rows);
            assert.equal(3, sobelY.cols);
        });
    });

    describe('SFM.R()', function(){
        it('generate row matrix from array', function(){
            var row = SFM.R([1,2,3]);
            assert.equal(row.TYPE_VECTOR, row.getType());
            assert.equal(1, row.rows);
        });
    });

    describe('SFM.C()', function(){
        it('generate column matrix from array', function(){
            var col = SFM.R([1,2,3]);
            assert.equal(col.TYPE_VECTOR, col.getType());
            assert.equal(1, col.rows);
        });
    });

    describe('SFM.I()', function(){
        it('generate identity matrix', function(){
            var e = SFM.I(3);
            assert.equal(1, e.det());
        });
    });

//    describe('SFM.M()', function(){
//    });

});
