'use strict';

var _ = require('underscore'),
    blur = require('ndarray-gaussian-filter'),
    ops = require('ndarray-ops'),
    pool = require('ndarray-scratch');

var settings = require('./settings.js');

var SCALES = settings.SCALES;

//===============================================

module.exports = DogPyramid;

//===============================================


/**
 *
 * @param {GuassianPyramid} scalespace
 *
 * @property {Scale[]}
 *
 * @constructor
 */
function DogPyramid(scalespace){

    var scales = scalespace.pyramid;

    this.pyramid = _.range(SCALES-1).map(function(index){

        var  image = scales[index].img,
            imageK = scales[index+1].img,
             sigma = scales[index].sigma;

        var buffer = pool.malloc(image.shape);

        ops.sub(buffer, imageK, image);

        return { img: buffer, sigma: sigma };

    });

}


/**
 * Release ndarrays
 */
DogPyramid.prototype.release = function(){
    this.pyramid.forEach(function(scale){
        pool.free(scale.img);
    });
    delete this.pyramid;
};


/**
 * Ndarray interface
 * @param {Number} row
 * @param {Number} col
 * @param {int} layer
 * @returns {Number}
 */
DogPyramid.prototype.get = function(row,col,layer){
    return this.pyramid[layer].img.get(col, row);
};