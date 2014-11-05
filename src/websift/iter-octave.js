'use strict';

var _ = require('underscore'),
    pool = require('ndarray-scratch');

var iterDoG = require('./dogspace.js'),
    convBlur = require('./blur.js');

var INIT_SIGMA = 1.6,
    INITIAL_SIGMA = 0.5,
    OCTAVES = 5;

module.exports = function(img, callback){

    var base = pool.malloc(img.shape),
        delta = Math.sqrt(INIT_SIGMA*INIT_SIGMA-INITIAL_SIGMA*INITIAL_SIGMA);
    convBlur(base, img, delta, 5);

    _.range(OCTAVES).forEach(function(octave){
        var newBase = iterDoG(base, octave, callback);
        pool.free(base);
        base = newBase;
    });

    pool.free(base);

};