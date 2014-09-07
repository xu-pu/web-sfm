'use strict';

var samples = require('../src/utils/samples.js'),
    sift = require('../src/websift/websift.js'),
    getGradient = require('../src/math/gradient.js');

samples.promiseImage(2)
    .then(function(img){
        console.log(getGradient(img, 1000,1000));
        //sift(img);
    });