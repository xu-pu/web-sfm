'use strict';

var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

//=====================================================


var DEFAULT_CAMERA = {
    width: 3008,
    height: 2000
};


//=====================================================


/**
 *
 * @param {Camera} [cam] - optional bounding camera
 * @returns {Feature}
 */
module.exports.getRandomFeature = function(cam){

    cam = cam || DEFAULT_CAMERA;

    return {

        row: Math.floor(cam.height * Math.random()),

        col: Math.floor(cam.width * Math.random()),

        vector: _.range(128).map(function(){
            return Math.floor(128*Math.random());
        })

    };

};