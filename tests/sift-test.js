'use strict';

var _ = require('underscore'),
    Promise = require('promise'),
    blur = require('ndarray-gaussian-filter');

var samples = require('../src/utils/samples.js'),
    getOrientation = require('../src/websift/orientation.js'),
    getGuassianKernel = require('../src/math/kernels.js').getGuassianKernel,
    testUtils = require('../src/utils/testing.js'),
    detect = require('../src/websift/detector.js'),
    isNotEdge = require('../src/websift/edge-filter.js'),
    OctaveSpace = require('../src/websift/octave-space'),
    detector = require('../src/websift/detector.js'),
    siftOrientation = require('../src/websift/orientation.js');


function pyramidTest(index){

    /**
    var filter = new PointFilter(),
        contrast = 255 * 0.5 * 0.04 / 5,
        detected = [];
*/
    samples
        .promiseImage(index)
        .then(function(img){

            var octaves = new OctaveSpace(img);

            while (octaves.hasNext()) {
                octaves.next();
            }
/*
            return Promise.all([
                testUtils.promiseVisualPoints('/home/sheep/Code/sift-detected.png', index, detected),
                testUtils.promiseVisualPoints('/home/sheep/Code/sift-filtered.png', index, filter.results),
                testUtils.promiseVisualPoints('/home/sheep/Code/sift-edge.png', index, filter.edge)
            ]);
*/
        });
}


function pyramidtest(){

    var img = require('lena');

    var octaves = new OctaveSpace(img);

    while (octaves.hasNext()) {
        octaves.next();
    }

}

pyramidtest();


/**
 * @constructor
 */
function PointFilter(){

    this.edge = [];
    this.results = [];

    this.check = function(dogspace, layer, row, col, step) {
        var point = { row: row * step, col: col * step };
        if (isNotEdge(dogspace.dogs[layer], row, col)) {
            this.results.push(point);
            console.log('Found one!');
        }
        else {
            this.edge.push(point);
            console.log('Did not pass edge filter');
        }
    };
}

//pyramidTest(6);