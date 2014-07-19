var assert = require('assert');

var lena = require('lena');
var grayscale = require('luminance');
var testImg = grayscale(lena);

describe('WebSIFT and its internals', function(){

    var getDoG = require('../src/websift/dogspace.js');

    describe('DoG results', function(){

        it('runs', function(){
            //assert.equal(true, _.isFunction(SFM.tracking));
            assert.doesNotThrow(function(){
                var result = getDoG(testImg, 0);
            });
        });

    });

    describe('SIFT detector', function(){

    })

});