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


module.exports = getPointOrientation;


/**
 *
 * @param {DoG} dog
 * @param {number} row
 * @param {number} col
 * @param {Object} [options]
 * @return {number[]}
 */
function getPointOrientation(dog, row, col, options){
    console.log('orienting feature points');
    var hist = generateHist(dog, row, col);
    smoothHist(hist);
    var maxIndex = getMaxIndex(hist);
    return getOrientations(hist, maxIndex);
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
    return hist;
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
    var maximum = hist[maxIndex],
        directions = [],
        iterBin;
    for (iterBin=0; iterBin<BINS; iterBin++) {
        if (hist[iterBin]/maximum >= ACCEPT_THRESHOLD) {
            directions.push(BIN_SIZE * iterBin);
        }
    }
    return directions;
}