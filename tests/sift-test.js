'use strict';

var _ = require('underscore'),
    blur = require('ndarray-gaussian-filter'),
    ops = require('ndarray-ops'),
    pool = require('ndarray-scratch');


var samples = require('../src/utils/samples.js'),
    sift = require('../src/websift/websift.js'),
    getGradient = require('../src/math/gradient.js'),
    getOrientation = require('../src/websift/orientation.js'),
    getGuassianKernel = require('../src/math/kernels.js').getGuassianKernel,
    detect = require('../src/websift/detector.js'),
    isNotEdge = require('../src/websift/websift.js');


function testDetector(index){
    return samples
        .promiseImage(index)
        .then(function(img){

            var layers = _.range(4).map(function(index){
                var k = Math.pow(2, 1/5);
                var sigma = Math.pow(k, index);
                var buffer = pool.clone(img);
                return blur(buffer, sigma);
            });

            console.log('gussians generated');

            var dogs = _.range(3).map(function(index){
                var k = Math.pow(2, 1/5),
                    sigma = Math.pow(k, index),
                    buffer = pool.malloc(img.shape);
                ops.sub(buffer, layers[index+1], layers[index]);
                return { img: buffer, sigma: sigma };
            });

            console.log('dogs generated');

            layers.forEach(function(buffer){
                pool.free(buffer);
            });

            console.log('guassians released');

            var features = [];

            detect(dogs, function(space, row, col){
                console.log('found one');
                features.push({
                    row: row,
                    col: col
                });
            });

            console.log('detection finished');

            dogs.forEach(function(dog){
                pool.free(dog.img);
            });

            console.log('dogs released');

        });
}

testDetector(1);