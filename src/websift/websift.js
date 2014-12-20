'use strict';

var _ = require('underscore');

var OctaveSpace = require('./octave-space'),
    detector = require('./detector.js'),
    isNotEdge = require('./edge-filter.js'),
    siftOrientation = require('./orientation.js');

//=================================================================


/**
 * the main function of this file, calculate SIFT of the image
 *
 * @param img
 * @param {object} [options]
 * @param {int} [options.octaves]
 * @param {int} [options.scales]
 * @param {int} [options.kernelSize]
 * @returns {Feature[]}
 */
module.exports = function(img, options) {

    var octaves = new OctaveSpace(img),
        oct, scales, dogs, oi = octaves.nextOctave,
        features = [];

    while (octaves.hasNext()) {

        oct    = octaves.next();
        scales = oct.scales;
        dogs   = oct.dogs;

        detector(

            dogs, scales,

            /**
             * SIFT detector callback
             * @param {Scale} scale
             * @param {number} row
             * @param {number} col
             */
            function(scale, row, col){
                if (isNotEdge(scale, row, col)) {
                    features.push({ row: row, col: col });
                }
            }

        );

        oi = octaves.nextOctave;

    }

    return features;

};