'use strict';

var _ = require('underscore');

var siftDetector = require('./detector.js'),
    getDoG = require('./dogspace.js');

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
        var dog = getDoG(img, octave);
        features += siftDetector(dog, octave);
    });

    return features;
}
