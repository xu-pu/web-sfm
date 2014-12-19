'use strict';

var _ = require('underscore'),
    blur = require('ndarray-gaussian-filter'),
    ops = require('ndarray-ops'),
    pool = require('ndarray-scratch'),
    downsample = require('ndarray-downsample2x');

var convBlur = require('./blur.js');

var INTERVALS = 3,
    SCALES = INTERVALS + 3,
    INIT_SIGMA = 1.6,
    INITIAL_SIGMA = 0.5,
    OCTAVES = 5;

//===============================================


/**
 *
 * @param img
 * @param callback
 */
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

/**
 * @param baseImage
 * @param {Number} octave
 * @param {Function} callback
 */
function iterDoGs(baseImage, octave, callback) {

    console.log('guassians released');

    var dogspace = new DogSpace(baseImage, octave),
        dogs = dogspace.dogs;

    _.range(1, dogs.length-1).forEach(function(layer){
        callback(dogspace, layer, octave);
    });

    console.log('scale iteration finished');

    dogs.forEach(function(dog){
        pool.free(dog.img);
    });

    console.log('dogs released');

    return dogspace.tail.img;
}


/**
 *
 * @param baseImage
 * @param {Number} octave
 * @constructor
 */
function DogSpace(baseImage, octave){

    console.log('Calculating DoG Space');

    var img;
    if (octave > 0) {
        img = pool.malloc(baseImage.step(2,2).shape);
        downsample(img, baseImage, 0, 255);
    }
    else {
        img = pool.clone(baseImage);
    }

    var scales = genGuassianPyramid(img);
    this.tail = scales[SCALES-1];
    this.dogs = genDogPyramid(scales);

    console.log('dogs generated');

    _.range(SCALES-1).forEach(function(scale){
        pool.free(scales[scale].img);
    });

}

/**
 * Ndarray interface
 * @param {Number} row
 * @param {Number} col
 * @param {Number} layer
 * @returns {Number}
 */
DogSpace.prototype.get = function(row,col,layer){
    return this.dogs[layer].img.get(col, row);
};


/**
 * @param base
 * @returns {Scale[]}
 */
function genGuassianPyramid(base){

    var k = Math.pow(2, 1/INTERVALS),
        delta = Math.sqrt(k*k-1),
        space = [{ img: base, sigma: INIT_SIGMA }];

    _.range(1, SCALES).forEach(function(layer){
        var previous = space[layer-1],
            deltaSigma = previous.sigma * delta,
            sigma = INIT_SIGMA * Math.pow(k, layer);
        console.log('convoluting image with delta sigma ' + deltaSigma);

        //var buffer = pool.clone(space[layer-1].img);
        //blur(buffer, deltaSigma);

        var buffer = pool.malloc(base.shape);
        convBlur(buffer, previous.img, deltaSigma, 5);

        console.log('convoluting complete, resolution ' + buffer.shape[0] + '*' + buffer.shape[1]);
        space[layer] = { img: buffer, sigma: sigma };
    });

    return space;

}


/**
 *
 * @param {Scale[]} scales
 * @returns {DoG[]}
 */
function genDogPyramid(scales){
    return _.range(SCALES-1).map(function(index){
        var image = scales[index].img,
            imageK = scales[index+1].img,
            sigma = scales[index].sigma;
        var buffer = pool.malloc(image.shape);
        ops.sub(buffer, imageK, image);
        return { img: buffer, sigma: sigma };
    });

}