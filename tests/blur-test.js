'use strict';

var pool = require('ndarray-scratch');

var blur = require('../src/websift/blur.js'),
    samples = require('../src/utils/samples.js'),
    testUtils = require('../src/utils/testing.js'),
    kernels = require('../src/math/kernels.js');

function blurTest(i){
    samples
        .promiseImage(i)
        .then(function(img){
            var blured1 = pool.malloc(img.shape);
            var blured2 = pool.malloc(img.shape);

            console.log('1');
            blur(blured1, img, 1.2, 3);
            console.log('2');
            blur(blured2, blured1, 1.2, 3);

            testUtils.promiseSaveNdarray(img, '/home/sheep/Code/origin.png');
            testUtils.promiseSaveNdarray(blured1, '/home/sheep/Code/blured1.png');
            testUtils.promiseSaveNdarray(blured2, '/home/sheep/Code/blured2.png');
        });
}

function kernelTest(){
    console.log(kernels.getGuassianKernel(5, 1).elements);
}

//kernelTest();

blurTest(2);