'use strict';

var samples = require('../src/utils/samples.js'),
    sift = require('../src/websift/websift.js'),
    getGradient = require('../src/math/gradient.js'),
    getOrientation = require('../src/websift/orientation.js'),
    getGuassianKernel = require('../src/math/kernels.js').getGuassianKernel;

samples.promiseImage(2)
    .then(function(img){
        console.log(sift(img));
        //sift(img);
    });