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
 * DetectedFeature => OrientedFeature[]
 * @param gradient
 * @param {DetectedFeature} df
 * @returns {OrientedFeature[]}
 */
exports.orient = function(gradient, df){

    return exports.getOrientations(gradient, df)
        .map(function(ori){
            var p = _.clone(df);
            p.orientation = ori;
            return p;
        });

};


/**
 *
 * @param gradient
 * @param {DetectedFeature} f
 * @returns {number[]}
 */
exports.getOrientations = function(gradient, f){

    var hist = exports.generateHist(gradient, f);
    var smoothedHist = smoothHist(hist);
    var thresh = getThreshold(smoothedHist);
    var directions =  exports.interpOrientations(smoothedHist, thresh);
    return directions.length > 4 ? directions.slice(0,4) : directions;

    /**
     * @param {number[]} hist
     * @returns {number[]}
     */
    function smoothHist(hist){
        return hist.map(function(mag, index){
            var pre = index === 0 ? BINS-1 : index-1,
                nex = index === BINS-1 ? 0 : index+1;
            //return 0.25*hist[pre] + 0.5*hist[index] + 0.25*hist[nex];
            return (hist[pre]+hist[index]+hist[nex]) / 3;
        });
    }


    /**
     * @param {number[]} hist
     * @returns {number}
     */
    function getThreshold(hist){
        var maximum=-Infinity, iterOrien;
        for (iterOrien=0; iterOrien<BINS; iterOrien++) {
            if (hist[iterOrien]>maximum) {
                maximum = hist[iterOrien];
            }
        }
        return maximum * ACCEPT_THRESHOLD;
    }

};


/**
 * @param gradient
 * @param {DetectedFeature} f
 * @returns {number[]}
 */
exports.generateHist = function(gradient, f){

    var    row = Math.round(f.row),
           col = Math.round(f.col),
         sigma = SIGMA_0 * Math.pow(2, f.scale/INTERVALS),
        sigmaw = sigma * WINDOW_FACTOR,
        radius = Math.floor(sigmaw * RADIUS_FACTOR),
          hist = shortcuts.zeros(BINS),
        weight = kernels.getGuassian2d(sigmaw);

    var x, y, bin, mag, ori;
    for (x=-radius; x<=radius; x++) {
        for(y=-radius; y<=radius; y++){
            mag = gradient.get(col+x, row+y, 0);
            ori = gradient.get(col+x, row+y, 1);
            if (mag) {
                bin = Math.floor(ori*BINS/PI2) % BINS;
                hist[bin] += mag * weight(x,y);
            }
        }
    }

    return hist;

};


/**
 * @param {number[]} hist
 * @param {number} thresh
 * @returns {number[]}
 */
exports.interpOrientations = function(hist, thresh){

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

    return directions;

    function histInterp(l,c,r){
        return ((l-r)/2)/(l-2*c+r);
    }

};