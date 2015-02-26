'use strict';

var _ = require('underscore');

var OctaveSpace = require('./octave-space'),
    detector = require('./detector.js'),
    orientation = require('./orientation.js'),
    descriptor = require('./descriptor.js');

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
module.exports.sift = function(img, options) {

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
             * @param {DetectedFeature} detectedF
             */
            function(scale, detectedF){
                if (isNotEdge(scale, detectedF.row, detectedF.col)) {
                    orientation.getOrientation(scale, detectedF)
                        .forEach(function(orientedF){
                            features.push(descriptor.getDescriptor(scale, orientedF));
                        });
                }
            }

        );

        oi = octaves.nextOctave;

    }

    return features;

};



module.exports.forEachDetected = function(img, callback){

    var octaves = new OctaveSpace(img),
        oct, scales, dogs, oi = octaves.nextOctave;

    while (octaves.hasNext()) {

        oct    = octaves.next();
        scales = oct.scales;
        dogs   = oct.dogs;

        detector.detect(dogs, scales, callback);

        oi = octaves.nextOctave;

    }

};