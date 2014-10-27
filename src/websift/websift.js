'use strict';

/**
 * @typedef {{row: number, col: number, vector: number[]}} Feature
 */

var _ = require('underscore');

var detector = require('./detector.js'),
    iterOctave = require('./iterOctave.js'),
    isNotEdge = require('./edge-filter.js'),
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
    iterOctave(img, function(dogs, octave){
        detector(dogs, octave, function(space, row, col){
            if (isNotEdge(space, row, col)) {
                features.push({ row: row, col: col });
            }
        });
    });

    return features;
}