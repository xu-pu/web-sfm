var assert = require("assert");
var _ = require("../../venders/underscore/underscore.js");
require('../../venders/numericjs/src/numeric.js');

describe('unittest examples', function(){

    describe('Array.prototype.indexOf()', function(){
        it('should return -1 when the value is not present', function(){
            assert.equal(-1, [1,2,3].indexOf(5));
            assert.equal(-1, [1,2,3].indexOf(0));
        })
    });

    describe('import numeric', function(){
        it('numeric should exist', function(){
            assert.equal(true, _.isFunction(numeric.dot));
        })
    });

    describe('import underscore', function(){
        it('numeric should exist', function(){
            assert.equal(true, _.isFinite(1));
        })
    });

});