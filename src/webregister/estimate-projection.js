'use strict';

var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

var lma      = require('../math/nonlinear.js').lma,
    ransac   = require('./../math/ransac.js'),
    cord     = require('../utils/cord.js'),
    laUtils  = require('../math/la-utils.js'),
    geoUtils = require('../math/geometry-utils.js');

//==========================================================

var PROJECTION_MINIMUM = 10;

//==========================================================


/**
 *
 * @param {{ X: HomoPoint3D, x: HomoPoint2D }[]} tracks
 * @returns Matrix
 */
exports.estP = function(tracks){

    if (tracks.length < PROJECTION_MINIMUM){
        throw 'More matches needed';
    }

/*
    var results = ransac({
        dataset: tracks,
        metadata: null,
        subset: PROJECTION_MINIMUM,
        relGenerator: module.exports.estimateProjection,
        errorGenerator: module.exports.projectionError,
//        outlierThreshold: 0.05,
        outlierThreshold: 0.2,
//        errorThreshold: 0.004,
        errorThreshold: 1,
        trials: 2000
    });

    var P = results.rel;
*/

    var P = module.exports.estimateProjection(tracks);

    return module.exports.refineProjection(P, tracks);

};


/**
 *
 * @param {{ X: Vector, x: Vector }[]} tracks
 * @param {Camera} shape
 * @returns {Matrix}
 */
exports.getRobustCameraParams = function(tracks, shape){

    if (tracks.length < PROJECTION_MINIMUM){
        throw 'More matches needed';
    }

    var results = ransac({
        dataset: tracks,
        metadata: null,
        subset: PROJECTION_MINIMUM,
        relGenerator: exports.estimateProjection,
        errorGenerator: exports.projectionError,
        outlierThreshold: 0.05,
        errorThreshold: 0.004*Math.max(shape.width, shape.height),
        trials: 1000
    });

    var P = results.rel;

    return exports.refineProjection(P, results.dataset);

};


/**
 * Estimate projection matrix from imgCord/3dCord pairs
 * @param {{ X: HomoPoint3D, x: HomoPoint2D }[]} dataset
 * @returns {Matrix}
 */
exports.estimateProjection = function(dataset){

    var A = [];

    dataset.forEach(function(pair){

        var X = pair.X,
            x = pair.x,
            XX = Matrix.create([X.elements]);

        laUtils.crossVector(x).elements.forEach(function(skewed){
            var xx = Matrix.create(skewed),
                coeM = xx.x(XX),
                coeV = _.flatten(coeM.elements);
            A.push(coeV);
        });

    });

    var solve = laUtils.svdSolve(Matrix.create(A));

    return laUtils.inflateVector(solve, 3, 4);

};


/**
 *
 * @param {Matrix} P
 * @param {{ X: HomoPoint3D, x: HomoPoint2D }[]} tracks
 * @returns {Matrix}
 */
exports.refineProjection = function(P, tracks){

    var refined = lma(
        function(parameter){
            var pro = laUtils.inflateVector(parameter, 3, 4);
            return Vector.create(tracks.map(function(track){
                return exports.projectionError(pro, track);
            }))
        },
        laUtils.flattenMatrix(P).x(10000), // Projection matrix is up to scale. this fator seems to affect the out come significantly
        Vector.Zero(tracks.length)
    );

    return laUtils.inflateVector(refined, 3, 4);

};


/**
 * @param {Matrix} P
 * @param {{ X: HomoPoint3D, x: HomoPoint2D }} pair
 * @returns {number}
 */
exports.projectionError = function(P, pair){
    return geoUtils.distHomo2D(P.x(pair.X), pair.x);
};