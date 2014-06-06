var assert = require("assert");
var _ = require("../venders/underscore/underscore.js");
require('../venders/numericjs/src/numeric.js');

describe('Array', function(){
    describe('#indexOf()', function(){
        it('should return -1 when the value is not present', function(){
            assert.equal(-1, [1,2,3].indexOf(5));
            assert.equal(-1, [1,2,3].indexOf(0));
        })
    })
});


describe('numericjs', function(){
    describe('import', function(){
        it('numeric should exist', function(){
            assert.equal(true, _.isFunction(numeric.dot));
        })
    })
});


describe('underscore', function(){
    describe('import', function(){
        it('numeric should exist', function(){
            assert.equal(true, _.isFinite(1));
            console.log(window);
        })
    })
});