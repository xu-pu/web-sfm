'use strict';

var _ = require('underscore'),
    ndarray = require('ndarray');

var OctaveSpace = require('./octave-space'),
    detector = require('./detector.js'),
    orientation = require('./orientation.js'),
    descriptor = require('./descriptor.js');

//=================================================================


/**
 * the main function of this file, calculate SIFT of the image
 *
 * @param img
 * @param options
 * @returns {{ points: ArrayBuffer, vectors: ArrayBuffer }}
 */
exports.sift = function(img, options) {

    var points = [];
    var vectors = [];

    exports.forEachDetected(img, function(scales, df){
        var buffer = scales.gradientCache[df.layer];
        orientation.orient(buffer, df).forEach(function(of){
            points.push(of);
            vectors.push(descriptor.getVector(buffer, of));
        });
    });

    var ps = points.length, vs = vectors.length;

    if (ps !== vs) { throw 'points and vectors should have same length'}

    var pArr = new Float32Array(4*ps),
        vArr = new Uint8Array(4*vs),
        pND = ndarray(pArr, [ps, 4]),
        vND = ndarray(vArr, [vs, 128]);

    points.forEach(function(p, xi){
        pND.set(xi, 0, p.row);
        pND.set(xi, 1, p.col);
        pND.set(xi, 2, p.orientation);
        pND.set(xi, 3, p.scale);
    });

    vectors.forEach(function(vector, xi){
        v.forEach(function(v, vi){
            vND.set(xi, vi, v);
        });
    });

    return {
        points: pArr.buffer,
        vectors: vArr.buffer
    }

};


/**
 *
 * @param img
 * @param {function} callback
 */
exports.forEachDetected = function(img, callback){

    var octaves = new OctaveSpace(img),
        oct, scales, dogs, oi = octaves.nextOctave;

    while (octaves.hasNext()) {

        oct    = octaves.next();
        scales = oct.scales;
        dogs   = oct.dogs;

        detector.detect(dogs, scales, function(f){
            callback(scales, f);
        });

        oi = octaves.nextOctave;

    }

};