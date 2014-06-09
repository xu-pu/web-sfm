var assert = require("assert");
var SFM = require("../build/scripts/sfmunittest.js");
var _ = require("../../venders/underscore/underscore.js");

describe('SFM algorithms', function(){
    describe('key point tracking algorithm', function(){
        it('should be a function', function(){
            assert.equal(true, _.isFunction(SFM.tracking));
        });
    })
});

describe('Linear algebra algorithms', function(){
    describe('util functions', function(){
        it('SFM.M() generate matrix objects', function(){
            var sobelY = SFM.M(SFM.SOBEL_KERNEL_Y);
            assert.equal(3, sobelY.rows);
            assert.equal(3, sobelY.cols);
        });
    })
});
