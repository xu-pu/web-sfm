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
                var result = getDoG(testImg, 0);
//                result.forEach(function(dog){
//                    imgshow(toRGB(dog.img));
//                });
//                console.log(result[0].dtype);
            });
        });

    });

    describe('SIFT detector', function(){
        it('runs', function(){
            assert.doesNotThrow(function(){
                var dogs = getDoG(testImg, 0);
                siftDetector(dogs, 0, function(){
                    console.log('found one');
                })
            });
        });
    })

});