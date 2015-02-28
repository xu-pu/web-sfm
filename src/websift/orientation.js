'use strict';

var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

var shortcuts = require('../utils/shortcuts.js'),
    kernels = require('../math/kernels.js'),
    settings = require('./settings.js');

var ACCEPT_THRESHOLD = 0.8,
       WINDOW_FACTOR = settings.ORIENTATION_WINDOW_FACTOR,
       RADIUS_FACTOR = settings.ORIENTATION_RADIUS_FACTOR,
                BINS = settings.ORIENTATION_BINS,
             SIGMA_0 = settings.SIGMA_0,
           INTERVALS = settings.INTERVALS,
                  PI = Math.PI,
                 PI2 = PI * 2;

//==========================================================


/**
 *
 * @param {GuassianPyramid} scales
 * @param {DetectedFeature} f
 * @returns {OrientedFeature[]}
 */
exports.getOrientation = function(scales, f){

    console.log('Enter orientation assignment');

    var hist = exports.generateHist(scales, f);
    var smoothedHist = exports.smoothHist(hist);
    var thresh = exports.getThreshold(smoothedHist);
    var orientations = exports.getOrientations(smoothedHist, thresh);

    return orientations.map(function(ori){
        var p = _.clone(f);
        p.orientation = ori;
        return p;
    });

};


/**
 * @param {GuassianPyramid} scales
 * @param {DetectedFeature} f
 * @returns {number[]}
 */
exports.generateHist = function(scales, f){

    var  layer = f.layer,
           row = Math.round(f.row),
           col = Math.round(f.col),
         sigma = SIGMA_0 * Math.pow(2, f.scale/INTERVALS),
        sigmaw = sigma * WINDOW_FACTOR,
        radius = Math.floor(sigmaw * RADIUS_FACTOR),
          hist = shortcuts.zeros(BINS),
        weight = kernels.getGuassian2d(sigmaw);

    var x, y, gradient, bin;
    for (x=-radius; x<=radius; x++) {
        for(y=-radius; y<=radius; y++){
            gradient = scales.getGradient(row+y, col+x, layer);
            if (gradient) {
                bin = Math.floor(BINS*gradient.ang/PI2) % BINS;
                hist[bin] += gradient.mag * weight(x,y);
            }
        }
    }

    return hist;

};


/**
 * @param {number[]} hist
 * @returns {number[]}
 */
exports.smoothHist = function(hist){
    return hist.map(function(mag, index){
        var pre = index === 0 ? BINS-1 : index-1,
            nex = index === BINS-1 ? 0 : index+1;
//        return 0.25*hist[pre] + 0.5*hist[index] + 0.25*hist[nex];
        return (hist[pre]+hist[index]+hist[nex]) / 3;
    });
};


/**
 * @param {number[]} hist
 * @returns {number}
 */
exports.getThreshold = function(hist){
    var maximum=-Infinity, iterOrien;
    for (iterOrien=0; iterOrien<BINS; iterOrien++) {
        if (hist[iterOrien]>maximum) {
            maximum = hist[iterOrien];
         }
    }
    return maximum * ACCEPT_THRESHOLD;
};


/**
 * @param {number[]} hist
 * @param {number} thresh
 * @returns {number[]}
 */
exports.getOrientations = function(hist, thresh){

    var directions = [];

    _.range(BINS).forEach(function(bin){
        var mag = hist[bin],
            pre = bin === 0 ? BINS-1 : bin-1,
            nex = bin === BINS-1 ? 0 : bin+1;
        if (mag > hist[pre] && mag > hist[nex] && mag >= thresh) {
            var offset = histInterp(hist[pre], mag, hist[nex]);
            directions.push( (bin+offset+0.5)*PI2/BINS );
        }
    });

    return directions.length > 4 ? directions.slice(0,4) : directions;

    function histInterp(l,c,r){
        return ((l-r)/2)/(l-2*c+r);
    }

};