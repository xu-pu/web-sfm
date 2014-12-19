'use strict';

var _ = require('underscore'),
    blur = require('ndarray-gaussian-filter'),
    pool = require('ndarray-scratch');

var convBlur = require('./blur.js');

var INTERVALS = 3,
    SCALES = INTERVALS + 3,
    INIT_SIGMA = 1.6,
    INITIAL_SIGMA = 0.5,
    OCTAVES = 5;

//===============================================


/**
 *
 * @param base
 * @param octave
 *
 * @property {Scale[]} pyramid
 *
 * @constructor
 */
function GuassianPyramid(base, octave){

    var k = Math.pow(2, 1/INTERVALS),
        delta = Math.sqrt(k*k-1),
        space = [{ img: base, sigma: INIT_SIGMA }];

    _.range(1, SCALES).forEach(function(layer){

        var previous = space[layer-1],
            deltaSigma = previous.sigma * delta,
            sigma = INIT_SIGMA * Math.pow(k, layer);

        console.log('convoluting image with delta sigma ' + deltaSigma);

        var buffer = pool.malloc(base.shape);
        convBlur(buffer, previous.img, deltaSigma, 5);

        console.log('convoluting complete, resolution ' + buffer.shape[0] + '*' + buffer.shape[1]);

        space[layer] = { img: buffer, sigma: sigma };

    });

    this.pyramid = space;

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
