'use strict';

var _ = require('underscore'),
    Promise = require('promise'),
    blur = require('ndarray-gaussian-filter'),
    ops = require('ndarray-ops'),
    pool = require('ndarray-scratch');


var samples = require('../src/utils/samples.js'),
    sift = require('../src/websift/websift.js'),
    iterScales = require('../src/websift/dogspace.js'),
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

            var filter = new PointFilter(step);

            var contrast = 255 * 0.5 * 0.04 / 3;

            var detected = [];

            detect(dogs, contrast, function(space, row, col) {
                var point = { row: row*step, col: col*step };
                detected.push(point);
                filter.check(space, row, col);
            });

            console.log('detection finished');

            dogs.forEach(function(dog){
                pool.free(dog.img);
            });

            console.log('dogs released');

            Promise.all([
                testUtils.promiseVisualPoints('/home/sheep/Code/sift-detected.png', index, detected),
                testUtils.promiseVisualPoints('/home/sheep/Code/sift-filtered.png', index, filter.results),
                testUtils.promiseVisualPoints('/home/sheep/Code/sift-edge.png', index, filter.edge)
            ]);

        });
}


function pyramidTest(index){

    var filter = new PointFilter(),
        contrast = 255 * 0.5 * 0.04 / 3,
        detected = [];

    samples
        .promiseImage(index)
        .then(function(img){

            _.range(4).forEach(function(octave){
                var step = Math.pow(2, octave);
                iterScales(img, octave, function(dogs, o){
                    detect(dogs, contrast, function(space, row, col) {
                        var point = { row: row*step, col: col*step };
                        detected.push(point);
                        filter.check(space, row, col, step);
                    });
                });
            });

            return Promise.all([
                testUtils.promiseVisualPoints('/home/sheep/Code/sift-detected.png', index, detected),
                testUtils.promiseVisualPoints('/home/sheep/Code/sift-filtered.png', index, filter.results),
                testUtils.promiseVisualPoints('/home/sheep/Code/sift-edge.png', index, filter.edge)
            ]);

        });
}


/**
 * @constructor
 */
function PointFilter(){

    this.edge = [];
    this.results = [];

    this.check = function(space, row, col, step) {
        var point = { row: row * step, col: col * step };
        if (isNotEdge(space[1], row, col)) {
            this.results.push(point);
            console.log('Found one!');
        }
        else {
            this.edge.push(point);
            console.log('Did not pass edge filter');
        }
    };
}

//testDetector(1, 1);

pyramidTest(1,0);