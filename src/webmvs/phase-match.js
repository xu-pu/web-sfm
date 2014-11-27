'use strict';

var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

var triangulation = require('../webregister/triangulation.js'),
    Patch = require('./Patch.js');

//===============================================================


/**
 * The match phase in PMVS
 */
module.exports = function(){

};


/**
 *
 * @param {PmvsState} state
 * @param {ImageCellGrid} imgRef
 * @param {ImageCellGrid} img
 * @param {Vector} fRef
 * @param {Vector} f
 * @returns {Patch}
 */
function patchFromFeaturePair(state, imgRef, img, fRef, f){


    var images = state.images,
        R = imgRef;

    var initC = triangulation(imgRef.P, img.P, fRef, f);
    var initN;

    var initV = images.filter(function(img){

    });

    var initVstar = initV.filter(function(img){

    });

    var nc = refinePatch(initC, initN, initV, initVstar);

    var n = nc.n,
        c = nc.c;

    var V = images.filter(function(img){

    });

    var Vstar = initV.filter(function(img){

    });

    return new Patch({ c: c, n: n, R: R, V: V, Vstar: Vstar });

}