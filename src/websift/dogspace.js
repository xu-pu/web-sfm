'use strict';

var _ = require('underscore'),
    blur = require('ndarray-gaussian-filter'),
    ops = require('ndarray-ops'),
    pool = require('ndarray-scratch');

module.exports = getDoGs;

/**
 * @typedef {{img, sigma: number}} DoG
 */

/**
 *
 * @param img
 * @param octave
 * @param options
 * @returns DoG[]
 */
function getDoGs(img, octave, options) {

    console.log('calculating dogs');

    options = options || {};
    _.defaults(options, {
        scales: 5
    });

    var step = Math.pow(2, octave);

    var sigmas = _.range(options.scales).map(function(s){
        return Math.pow(2, octave+s/options.scales);
    });

    var scales = sigmas.map(function(sigma){
        var buffer = pool.clone(img);
        return blur(buffer, sigma).step(step, step);
    });

    var dogs = _.range(scales.length-1).map(function(index){
        var buffer = pool.malloc(scales[0].shape);
        ops.sub(buffer, scales[index], scales[index+1]);
        return {
            img: buffer,
            sigma: sigmas[index]
        };
    });

    scales.forEach(function(scale){
        pool.free(scale);
    });

    return dogs;
}