'use strict';

var samples = require('../src/utils/samples.js'),
    sift = require('../src/websift/websift.js'),
    getGradient = require('../src/math/gradient.js'),
    getOrientation = require('../src/websift/orientation.js'),
    getGuassianKernel = require('../src/math/kernels.js').getGuassianKernel;

console.log(getGuassianKernel(5,1));

samples.promiseImage(2)
    .then(function(img){
        //console.log(getOrientation({img: img, sigma: 1}, 1000,1000));
        //sift(img);
    });