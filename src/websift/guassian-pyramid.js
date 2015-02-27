'use strict';

var _ = require('underscore'),
    blur = require('ndarray-gaussian-filter'),
    pool = require('ndarray-scratch');

var convBlur = require('./blur.js'),
    settings = require('./settings.js');

var SCALES   = settings.SCALES,
    SIGMA_0  = settings.SIGMA_0,
    SIGMA_K  = settings.SIGMA_K,
    SIGMA_D0 = settings.SIGMA_D0;

//===============================================

module.exports = GuassianPyramid;

//===============================================


/**
 *
 * @param base
 * @param {int} octave
 *
 * @property {Scale[]} pyramid
 * @property {int} octave
 * @constructor
 */
function GuassianPyramid(base, octave){

    var space = [{ img: base, sigma: SIGMA_0 }];

    _.range(1, SCALES).forEach(function(layer){

        var previous = space[layer-1],
            deltaSigma = SIGMA_D0 * Math.pow(SIGMA_K, layer),
            sigma = SIGMA_0 * Math.pow(SIGMA_K, layer);

        console.log('convoluting image with delta sigma ' + deltaSigma);

        var buffer = pool.malloc(base.shape);
        convBlur(buffer, previous.img, deltaSigma);

        console.log('convoluting complete, resolution ' + buffer.shape[0] + '*' + buffer.shape[1]);

        space[layer] = { img: buffer, sigma: sigma, layer: layer, octave: octave };

    });

    this.pyramid = space;
    this.octave = octave;

}


/**
 * Get the tail scale as base of next octave
 */
GuassianPyramid.prototype.getNextBase = function(){
    return this.pyramid[this.pyramid.length-1].img;
};


/**
 * Release ndarrays
 */
GuassianPyramid.prototype.release = function(){
    this.pyramid.forEach(function(scale){
        pool.free(scale.img);
    });
    delete this.pyramid;
};
