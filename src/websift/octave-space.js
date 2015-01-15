'use strict';

var _ = require('underscore'),
    pool = require('ndarray-scratch');

var GuassianPyramid = require('./guassian-pyramid.js'),
    DogPyramid = require('./dog-pyramid.js'),
    convBlur = require('./blur.js'),
    imgUtils = require('../utils/image-conversion.js'),
    settings = require('./settings.js');

var INIT_SIGMA = settings.INIT_SIGMA,
    ASSUMED_SIGMA = settings.INITIAL_SIGMA,
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

    var scaleUp = Math.max(img.shape[0], img.shape[1]) < SIZE_THRESHOLD;

    var base, deltaSigma;

    if (scaleUp) {
        img = imgUtils.getSupersample(img);
        deltaSigma = Math.sqrt(INIT_SIGMA*INIT_SIGMA-4*ASSUMED_SIGMA*ASSUMED_SIGMA);
    }
    else {
        deltaSigma = Math.sqrt(INIT_SIGMA*INIT_SIGMA-ASSUMED_SIGMA*ASSUMED_SIGMA);
    }

    base = pool.malloc(img.shape);

    console.log('init blur begin');
    convBlur(base, img, deltaSigma, 5);
    console.log('init blur end');

    _.extend(this, {
        octaves: OCTAVES,
        nextOctave: scaleUp ? -1 : 0,
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