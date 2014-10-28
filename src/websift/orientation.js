'use strict';

var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

var derivatives = require('../math/derivatives.js'),
    getGradient = derivatives.gradient,
    getGuassianKernel = require('../math/kernels.js').getGuassianKernel;

var RADIUS = 8,
    WINDOW_SIZE = 2 * RADIUS + 1,
    BINS = 36,
    BIN_SIZE = 2*Math.PI/BINS,
    ACCEPT_THRESHOLD = 0.8;


module.exports = getFeatureOrientation;


/**
 *
 * @param {DoG} dog
 * @param {number} row
 * @param {number} col
 * @param {Object} [options]
 * @return {number[]}
 */
function getFeatureOrientation(dog, row, col, options){
    console.log('orienting feature points');
    var hist = generateHist(dog, row, col);
    var smoothedHist = smoothHist(hist);
    var maxIndex = getMaxIndex(smoothedHist);
    return getOrientations(smoothedHist, maxIndex);
}


/**
 * @param {DoG} dog
 * @param {number} row
 * @param {number} col
 */
function generateHist(dog, row, col){

    var img = dog.img,
        sigma = dog.sigma,
        orientations = new Float32Array(BINS),
        weightFunction = getGuassianKernel(WINDOW_SIZE, sigma*1.5);

    var x, y, gradient, bin;
    for (x=-RADIUS; x<=RADIUS; x++) {
        for(y=-RADIUS; y<=RADIUS; y++){
            gradient = getGradient(img, row+y, col+x);
            bin = Math.round(gradient.dir/BIN_SIZE) % BINS;
            if(bin < 0) {
                bin = bin+BINS;
            }
            orientations[bin] += gradient.mag * weightFunction(x,y);
        }
    }

}


function smoothHist(hist){
    return hist.map(function(mag, bin){
        var pre = bin === 0 ? BINS-1 : bin-1,
            nex = (bin+1) % BINS;
        return 0.25*hist[pre] + 0.5*hist[bin] + 0.25*hist[nex];
    });
}


/**
 * @param {number[]} hist
 * @returns {number}
 */
function getMaxIndex(hist){
    var maximum=-Infinity, maxIndex, iterOrien;
    for (iterOrien=0; iterOrien<BINS; iterOrien++) {
        if (hist[iterOrien]>maximum) {
            maximum = hist[iterOrien];
            maxIndex = iterOrien;
        }
    }
    return maxIndex;
}


/**
 * @param {number[]} hist
 * @param {number} maxIndex
 * @returns {number[]}
 */
function getOrientations(hist, maxIndex){

    var thresh = hist[maxIndex]*ACCEPT_THRESHOLD,
        directions = [];

    _.range(BINS).forEach(function(bin){
        var mag = hist[bin],
            pre = bin === 0 ? BINS-1 : bin- 1,
            nex = (bin+1) % BINS;
        if (mag > hist[pre] && mag > hist[nex] && mag >= thresh) {
            var offset = histInterp(hist[pre], hist[bin], hist[nex]);
            var interped = bin + offset;
            interped = interped >= BINS ? interped-BINS : interped;
            interped = interped < 0 ? interped+BINS : interped;
            directions.push(BIN_SIZE * interped);
        }
    });

    return directions;

    function histInterp(l,c,r){
        return ((l-r)/2)/(l-2*c+r);
    }

}