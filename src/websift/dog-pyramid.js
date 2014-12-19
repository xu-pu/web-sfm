'use strict';

var _ = require('underscore'),
    blur = require('ndarray-gaussian-filter'),
    ops = require('ndarray-ops'),
    pool = require('ndarray-scratch');

var INTERVALS = 3,
    SCALES = INTERVALS + 3;

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