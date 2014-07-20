var assert = require('assert');

var imgshow = require('ndarray-imshow');
var lena = require('lena');
var grayscale = require('luminance');
var getPixels = require('get-pixels');
var toRGB = require('../src/websift/gray2rgb.js');
var testImg = grayscale(lena);

describe('WebSIFT and its internals', function(){

    var getDoG = require('../src/websift/dogspace.js');
    var siftDetector = require('../src/websift/detector.js');

    describe('DoG results', function(){

        it('runs', function(){
            assert.doesNotThrow(function(){

                // test and show
                [].forEach(function(octave){
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

        it('pass large image', function(){
            var basePath = '/home/sheep/Code/Project/web-sfm/demo/Hall-Demo/images/00000001.jpg';
            getPixels(basePath, function(err, img){
                console.log('image loaded');
                var g = grayscale(img);
                getDoG(g, 0);
//                console.log(img.shape.slice());
//                console.log(g.shape.slice());
//                console.log(g.get(1000,1000));
            });

//            promiseLargeImage(basePath).then(function(img){
//                assert.doesNotThrow(function(){});
//            });
        })


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