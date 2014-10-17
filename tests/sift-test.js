'use strict';

var _ = require('underscore'),
    Promise = require('promise'),
    blur = require('ndarray-gaussian-filter'),
    ops = require('ndarray-ops'),
    pool = require('ndarray-scratch');


var samples = require('../src/utils/samples.js'),
    sift = require('../src/websift/websift.js'),
    getGradient = require('../src/math/gradient.js'),
    getOrientation = require('../src/websift/orientation.js'),
    getGuassianKernel = require('../src/math/kernels.js').getGuassianKernel,
    testUtils = require('../src/utils/testing.js'),
    detect = require('../src/websift/detector.js'),
    isNotEdge = require('../src/websift/edge-filter.js');


function testDetector(index, octave){
    return samples
        .promiseImage(index)
        .then(function(img){
            var step = Math.pow(2, octave);
            var layers = _.range(4).map(function(layer){
                var k = Math.pow(2, 1/5),
                    sigma = Math.pow(2, octave) * Math.pow(k, layer),
                    buffer = pool.clone(img);
                console.log('convoluting image with sigma ' + sigma);
                var view = blur(buffer, sigma).step(step, step);
                console.log('convoluting complete, resolution ' + view.shape[0] + '*' + view.shape[1]);
                return view;
            });

            console.log('gussians generated');

            var dogs = _.range(3).map(function(index){
                var k = Math.pow(2, 1/5),
                    sigma = Math.pow(k, index),
                    buffer = pool.malloc(layers[0].shape);
                ops.sub(buffer, layers[index+1], layers[index]);
                return { img: buffer, sigma: sigma };
            });

            console.log('dogs generated');

            layers.forEach(function(buffer){
                pool.free(buffer);
            });

            console.log('guassians released');

            var detected = [],
                edge = [],
                filtered = [];

            detect(dogs, function(space, row, col){
                var point = { row: row*step, col: col*step };
                detected.push(point);
                if (isNotEdge(space[1], row, col)) {
                    filtered.push(point);
                    console.log('Found one, passed edge filter');
                }
                else {
                    edge.push(point);
                    console.log('found one, did not pass edge filter');
                }
            });

            console.log('detection finished');

            console.log(detected.length);
            console.log(filtered.length);

            dogs.forEach(function(dog){
                pool.free(dog.img);
            });

            console.log('dogs released');

            Promise.all([
                testUtils.promiseVisualPoints('/home/sheep/Code/sift-detected.png', index, detected),
                testUtils.promiseVisualPoints('/home/sheep/Code/sift-filtered.png', index, filtered),
                testUtils.promiseVisualPoints('/home/sheep/Code/sift-edge.png', index, edge)
            ]);

        });
}

testDetector(1, 1);