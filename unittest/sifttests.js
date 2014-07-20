var assert = require('assert');
var imgshow = require('ndarray-imshow');
var lena = require('lena');
var grayscale = require('luminance');
var toRGB = require('../src/websift/gray2rgb.js');
var testImg = grayscale(lena);

describe('WebSIFT and its internals', function(){

    var getDoG = require('../src/websift/dogspace.js');
    var siftDetector = require('../src/websift/detector.js');

    describe('DoG results', function(){

        it('runs', function(){
            assert.doesNotThrow(function(){

                // test and show
                [0,1,2,3].forEach(function(octave){
                    var result = getDoG(testImg, octave);
                    result.forEach(function(dog){
                        imgshow(toRGB(dog.img));
                    });
                });

                // only test, do not show
                [].forEach(function(octave){
                    getDoG(testImg, octave);
                });

            });
        });

    });

    describe('SIFT detector', function(){
        it('runs', function(){
            assert.doesNotThrow(function(){
                var dogs = getDoG(testImg, 0);
                siftDetector(dogs, 0, function(){
                    //console.log('found one');
                })
            });
        });
    });

});