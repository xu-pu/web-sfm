'use strict';

/**
 * @typedef {{row: number, col: number, vector: number[]}} Feature
 */

var _ = require('underscore');

var siftDetector = require('./detector.js'),
    getDoGs = require('./dogspace.js'),
    siftOrientation = require('./orientation.js');

module.exports = sift;

/**
 * the main function of this file, calculate SIFT of the image
 *
 * @param img
 * @param {object} [options]
 * @param {int} [options.octaves]
 * @param {int} [options.scales]
 * @param {int} [options.kernelSize]
 * @returns {object[]}
 */
function sift(img, options) {

    options = options || {};

    _.defaults(options, {
        octaves: 4,
        scales: 5,
        kernelSize: 3,
        contractThreshold: 0,
        orientationWindow: 17
    });

    var features = [];
    _.range(options.octaves).forEach(function(octave){
        var dogs = getDoGs(img, octave);
        siftDetector(dogs, octave, function(dog, row, col){
            features.push(siftOrientation(dog, row, col));
            if (features.length % 20 === 0) {
                console.log('find 20 more');
            }
        });
    });

    return features;
}