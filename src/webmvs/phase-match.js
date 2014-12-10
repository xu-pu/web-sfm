'use strict';

var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

var lma = require('../math/levenberg-marquardt.js'),
    geoUtils = require('../math/geometry-utils.js'),
    triangulation = require('../webregister/triangulation.js'),
    Patch = require('./patch.js'),
    photometrics = require('./photometrics.js');

//===============================================================


/**
 * The match phase in PMVS
 */
module.exports = function(){

};


/**
 *
 * @param {PMVSContext} state
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


/**
 * @param {Patch} p
 * @param {int} mu
 */
function refinePatch(p, mu){

    var initParam = flatten(c,n);

    var Vs = _.without(Vstar, R);

    var refinedParam = lma(
        function(params){

            var cn = inflate(params),
                center = cn.c,
                normal = cn.n;

            var R = geoUtils.getRotationFromEuler(normal[0], normal[1], normal[2]);

            var sampleRefer;

            return Vector.create();

        },
        initParam,
        Vector.Zero(Vstar.length)
    );


    function inflate(params){}

    function flatten(c, n){}

}