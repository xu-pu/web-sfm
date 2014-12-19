'use strict';

var _ = require('underscore'),
    blur = require('ndarray-gaussian-filter'),
    pool = require('ndarray-scratch');

var GuassianPyramid = require('./guassian-pyramid.js'),
    DogPyramid = require('./dog-pyramid.js'),
    convBlur = require('./blur.js'),
    imgUtils = require('../utils/image-conversion.js');

var INTERVALS = 3,
    SCALES = INTERVALS + 3,
    INIT_SIGMA = 1.6,
    INITIAL_SIGMA = 0.5,
    OCTAVES = 5;

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

    var base = pool.malloc(img.shape),
        delta = Math.sqrt(INIT_SIGMA*INIT_SIGMA-INITIAL_SIGMA*INITIAL_SIGMA);
    convBlur(base, img, delta, 5);

    _.extend(this, {
        octaves: OCTAVES,
        nextOctave: 0,
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