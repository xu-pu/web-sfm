'use strict';

var pool = require('ndarray-scratch');

var blur = require('../src/websift/blur.js'),
    samples = require('../src/utils/samples.js'),
    testUtils = require('../src/utils/testing.js');

function blurTest(i){
    samples
        .promiseImage(i)
        .then(function(img){
            var blured1 = pool.malloc(img.shape);
            var blured2 = pool.malloc(img.shape);
            console.log('1');
            blur(blured1, img, 0.6, 5);
            console.log('2');
            blur(blured2, blured1, 0.6, 5);
            console.log('3');
            blur(blured1, blured2, 0.6, 5);
            console.log('4');
            blur(blured2, blured1, 0.6, 5);
            console.log('5');
            blur(blured1, blured2, 0.6, 5);
            console.log('6');
            blur(blured2, blured1, 0.6, 5);

            testUtils.promiseSaveNdarray(img, '/home/sheep/Code/origin.png');
            testUtils.promiseSaveNdarray(blured1, '/home/sheep/Code/blured1.png');
            testUtils.promiseSaveNdarray(blured2, '/home/sheep/Code/blured2.png');
        });
}

blurTest(2);