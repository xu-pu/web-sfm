'use strict';

var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

var shortcuts = require('../utils/shortcuts.js'),
    getGradient = require('../math/image-calculus.js').discreteGradient,
    kernels = require('../math/kernels.js'),
    settings = require('./settings.js');

var             BINS = settings.ORIENTATION_BINS,
          INIT_SIGMA = settings.INIT_SIGMA,
           INTERVALS = settings.INTERVALS,
        SIGMA_FACTOR = settings.ORIENTATION_SIGMA_FACTOR,
       RADIUS_FACTOR = settings.ORIENTATION_RADIUS_FACTOR,
    ACCEPT_THRESHOLD = 0.8,
                  PI = Math.PI,
                 PI2 = PI * 2;

//==========================================================


/**
 *
 * @param {Scale} scale
 * @param {DetectedFeature} f
 * @returns {OrientedFeature[]}
 */
module.exports.getOrientation = function(scale, f){

    console.log('Enter orientation assignment');

    var hist = generateHist(scale, f);
    var smoothedHist = smoothHist(hist);
    var thresh = getThreshold(smoothedHist);
    var orientations = getOrientations(smoothedHist, thresh);

    return orientations.map(function(ori){
        var p = _.clone(f);
        p.orientation = ori;
        return p;
    });

};


/**
 * @param {Scale} scale
 * @param {DetectedFeature} f
 */
function generateHist(scale, f){

    var    row = Math.round(f.row),
           col = Math.round(f.col),
           img = scale.img,
        factor = INIT_SIGMA * Math.pow(2, f.layer/INTERVALS),
        radius = Math.round(factor * RADIUS_FACTOR),
         sigma = factor * SIGMA_FACTOR,
          hist = shortcuts.zeros(BINS),
        weight = kernels.getGuassian2d(sigma);

    var x, y, gradient, bin;
    for (x=-radius; x<=radius; x++) {
        for(y=-radius; y<=radius; y++){
            gradient = getGradient(img, col+x, row+y);
            if (gradient) {
                bin = Math.round( BINS * (gradient.ori + PI) / PI2 );
                bin = bin < BINS ? bin : 0;
                hist[bin] += gradient.mag * weight(x,y);
            }
        }
    }

    return hist;

}


function smoothHist(hist){
    return hist.map(function(mag, index){
        var pre = index === 0 ? BINS-1 : index-1,
            nex = index === BINS-1 ? 0 : index+1;
        return 0.25*hist[pre] + 0.5*hist[index] + 0.25*hist[nex];
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


/**
 * @param {number[]} hist
 * @param {number} thresh
 * @returns {number[]}
 */
function getOrientations(hist, thresh){

    var directions = [];

    _.range(BINS).forEach(function(bin){
        var mag = hist[bin],
            pre = bin === 0 ? BINS-1 : bin-1,
            nex = bin === BINS-1 ? 0 : bin+1;
        if (mag > hist[pre] && mag > hist[nex] && mag >= thresh) {
            var offset = histInterp(hist[pre], mag, hist[nex]);
            var interped = mag + offset;
            interped = interped >= BINS ? interped-BINS : interped;
            interped = interped < 0 ? interped+BINS : interped;
            directions.push(interped*PI2/BINS - PI);
        }
    });

    return directions;

    function histInterp(l,c,r){
        return ((l-r)/2)/(l-2*c+r);
    }

}