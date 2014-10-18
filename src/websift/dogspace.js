'use strict';

var _ = require('underscore'),
    blur = require('ndarray-gaussian-filter'),
    ops = require('ndarray-ops'),
    pool = require('ndarray-scratch');

module.exports = iterScales;

/**
 * @typedef {{img, sigma: number}} DoG
 */

/**
 * @param img
 * @param {Number} octave
 * @param {Function} callback
 */
function iterScales(img, octave, callback) {

    console.log('calculating dogs');

    var SCALES = 5,
        step = Math.pow(2, octave),
        baseSigma = Math.pow(2, octave),
        k = Math.pow(2, 1/SCALES);

    var scales = _.range(SCALES).map(function(index){
        var sigma = baseSigma * Math.pow(k, index);
        console.log('convoluting image with sigma ' + sigma);
        var buffer = pool.clone(img);
        var view = blur(buffer, sigma).step(step, step);
        console.log('convoluting complete, resolution ' + view.shape[0] + '*' + view.shape[1]);
        return { img: view, sigma: sigma };
    });

    var dogs = _.range(SCALES-1).map(function(index){
        var img = scales[index].img,
            imgk = scales[index+1].img,
            sigma = scales[index].sigma;
        var buffer = pool.malloc(img.shape);
        ops.sub(buffer, imgk, img);
        return {
            img: buffer,
            sigma: sigma
        };
    });

    console.log('dogs generated');

    scales.forEach(function(scale){
        pool.free(scale.img);
    });

    console.log('guassians released');

    _.range(dogs.length-2).forEach(function(index){
        var space = dogs.slice(index, index+3);
        callback(space, octave);
    });

    console.log('scale iteration finished');

    dogs.forEach(function(dog){
        pool.free(dog.img);
    });

    console.log('dogs released');

}