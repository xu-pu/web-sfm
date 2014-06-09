'use strict';

var assert = require("assert");
var SFM = require("../../build/scripts/sfmunittest.js");
var _ = require("../../venders/underscore/underscore.js");

describe('SFM algorithms', function(){
    describe('key point tracking algorithm', function(){
        it('should be a function', function(){
            assert.equal(true, _.isFunction(SFM.tracking));
        });
    })
});