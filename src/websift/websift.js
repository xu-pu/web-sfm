var _ = require('underscore');
var iterOctaves = require('./octaves.js');
var siftDescriptor = require('./descriptor.js');
var siftDetector = require('./detector.js');

module.exports = sift;

/**
 * the main function of this file, calculate SIFT of the image
 *
 * @param {SFM.Grayscale} img
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
    iterOctaves(img, options, function(base, octaveIndex){
        var scales = SFM.getScales(base, octaveIndex, options);
        var octave = SFM.getDOGs(scales, options);
        siftDetector(octave, options, function(img, row, col){
            features.push({ row: row, col: col });
            /*            SFM.siftOrientation(img, row, col, options).forEach(function(dir){
             var f = SFM.siftDescriptor(img, row, col, dir);
             features.push(f);
             });
             */
        });
    });
    return features;
}
