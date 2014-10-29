'use strict';

var _ = require('underscore'),
    Promise = require('promise'),
    blur = require('ndarray-gaussian-filter'),
    ops = require('ndarray-ops'),
    pool = require('ndarray-scratch'),
    convolve = require('ndarray-convolve'),
    pack = require('ndarray-pack');


var samples = require('../src/utils/samples.js'),
    sift = require('../src/websift/websift.js'),
    iterScales = require('../src/websift/dogspace.js'),
    getOrientation = require('../src/websift/orientation.js'),
    getGuassianKernel = require('../src/math/kernels.js').getGuassianKernel,
    testUtils = require('../src/utils/testing.js'),
    detect = require('../src/websift/detector.js'),
    isNotEdge = require('../src/websift/edge-filter.js'),
    kernels = require('../src/math/kernels.js'),
    iterOctave = require('../src/websift/iter-octave.js');


function pyramidTest(index){

    var filter = new PointFilter(),
        contrast = 255 * 0.5 * 0.04 / 3,
        detected = [];

    samples
        .promiseImage(index)
        .then(function(img){

            iterOctave(img, function(dogs, octave){
                var step = Math.pow(2, octave);
                detect(dogs, contrast, function(space, row, col) {
                    var point = { row: row*step, col: col*step };
                    detected.push(point);
                    filter.check(space, row, col, step);
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

pyramidTest(6);