'use strict';

var _ = require('underscore'),
    pool = require('ndarray-scratch');

var GuassianPyramid = require('./guassian-pyramid.js'),
    DogPyramid = require('./dog-pyramid.js'),
    siftUtils = require('./utils.js'),
    imgUtils = require('../utils/image-conversion.js'),
    settings = require('./settings.js');

var SIGMA_0 = settings.SIGMA_0,
    SIGMA_N = settings.SIGMA_N,
    SIGMA_K = settings.SIGMA_K,
    SIZE_THRESHOLD = settings.IMAGE_SIZE_THRESHOLD,
    OCTAVES = settings.OCTAVES;

//===============================================

module.exports = OctaveSpace;

//===============================================


/**
 * @param img
 *
 * @property {int} nextOctave
 * @property {int} octaves
 *
 * @constructor
 */
function OctaveSpace(img){

    var scaleUp = Math.max(img.shape[0], img.shape[1]) < SIZE_THRESHOLD,
        initOctave = scaleUp ? -1 : 0,
        sa = SIGMA_0 * Math.pow(SIGMA_K, -1),
        sb = SIGMA_N * Math.pow(2, -initOctave),
        sd = Math.sqrt(sa*sa-sb*sb);

    if (scaleUp) {
        img = imgUtils.getSupersample(img);
    }

    var base = pool.malloc(img.shape);

    console.log('init blur begin');
    siftUtils.blur(base, img, sd);
    console.log('init blur end');

    _.extend(this, {
        octaves: OCTAVES,
        nextOctave: initOctave,
        base: base
    });

}


/**
 * Iteration util, has next octave or not
 * @returns {boolean}
 */
OctaveSpace.prototype.hasNext = function(){
    return this.nextOctave < this.octaves;
};


/**
 *
 * @returns {{ scales: GuassianPyramid, dogs: DogPyramid }}
 */
OctaveSpace.prototype.next = function(){

    if (!this.hasNext()) {
        throw 'Octave iteration ended!';
    }

    var base = this.base,
        octave = this.nextOctave;

    var scales = new GuassianPyramid(base, octave),
        dogs = new DogPyramid(scales);

    this.nextOctave++;

    if (this.hasNext()) {
        this.base = imgUtils.getDownsample(scales.getNextBase());
    }
    else {
        delete this.base;
    }

    pool.free(base);

    return { scales: scales, dogs: dogs };

};