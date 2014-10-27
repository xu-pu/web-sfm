'use strict';

var _ = require('underscore'),
    pool = require('ndarray-scratch');

var iterDoG = require('./dogspace.js');

var OCTAVES = 5;

module.exports = function(img, callback){
    var base = img;
    _.range(OCTAVES).forEach(function(octave){
        var newBase = iterDoG(base, octave, callback);
        pool.free(base);
        base = newBase;
    });
    pool.free(base);
};