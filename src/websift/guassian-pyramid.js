'use strict';

var _ = require('underscore'),
    blur = require('ndarray-gaussian-filter'),
    pool = require('ndarray-scratch');

var siftUtils = require('./utils.js'),
    settings = require('./settings.js');

var INTERVALS = settings.INTERVALS,
    SCALES    = settings.SCALES,
    SIGMA_0   = settings.SIGMA_0,
    SIGMA_K   = settings.SIGMA_K,
    SIGMA_D0  = settings.SIGMA_D0;

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
 * @property {int} width
 * @property {int} height
 * @property {[]} gradientCache
 * @constructor
 */
function GuassianPyramid(base, octave){

    var width = base.shape[0],
        height = base.shape[1],
        space = [{ img: base, sigma: SIGMA_0 }];

    _.range(1, SCALES).forEach(function(layer){
        var previous = space[layer-1],
            deltaSigma = SIGMA_D0 * Math.pow(SIGMA_K, layer),
            sigma = SIGMA_0 * Math.pow(SIGMA_K, layer);
        console.log('convoluting image with delta sigma ' + deltaSigma);
        var buffer = pool.malloc(base.shape);
        siftUtils.blur(buffer, previous.img, deltaSigma);
        console.log('convoluting complete, resolution ' + width + '*' + height);
        space[layer] = { img: buffer, sigma: sigma, layer: layer, octave: octave };
    });

    var cache = _.range(INTERVALS).map(function(interval){
        return siftUtils.cacheGradient(space[interval+1].img);
    });

    this.pyramid = space;
    this.gradientCache = cache;
    this.octave = octave;
    this.width = width;
    this.height = height;
}


/**
 * Get the tail scale as base of next octave
 * @param {int} row
 * @param {int} col
 * @param {int} layer
 * @returns {{ mag: number, ang: number } | null}
 */
GuassianPyramid.prototype.getGradient = function(row, col, layer){
    if ( row<0 || row>=this.height || col<0 || col>=this.width ) return null;
    var buffer = this.gradientCache[layer-1];
    return {
        mag: buffer.get(col, row, 0),
        ang: buffer.get(col, row, 1)
    };
};


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


    this.gradientCache.forEach(function(cache){
        pool.free(cache);
    });

    delete this.pyramid;
    delete this.gradientCache;

};
