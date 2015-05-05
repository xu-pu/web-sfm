'use strict';

var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

var lma      = require('../math/nonlinear.js').lma,
    ransac   = require('./../math/ransac.js'),
    cord     = require('../utils/cord.js'),
    laUtils  = require('../math/la-utils.js'),
    geoUtils = require('../math/geometry-utils.js'),
    camUtils = require('../math/projections.js'),
    decomp   = require('../math/matrix-decomposition.js');

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

    var P = module.exports.estimateProjection(tracks);

    return module.exports.refineProjection(P, tracks);

};


/**
 *
 * @param {{ X: Vector, x: Vector }[]} tracks
 * @param {Camera} shape
 * @returns {CameraParams}
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
        outlierThreshold: 0.01,
        errorThreshold: 0.004*Math.max(shape.width, shape.height),
        trials: 1000
    });

    var inliers = results.dataset;
    var P = exports.estimateProjection(inliers);
    return exports.paramsFromP(P);

};

/**
 * @param {Matrix} P
 * @return {CameraParams}
 */
exports.paramsFromP = function(P){
    var model = decomp.KRt(P),
        K = model.K,
        R = model.R,
        t = model.t;
    return {
        r: geoUtils.getEulerAngles(R),
        t: t.elements,
        f: K.e(1,1),
        px: K.e(1,3), py: K.e(2,3),
        k1: 0, k2: 0
    };
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
 * @param {CameraParams} params
 * @param {{ X: HomoPoint3D, x: HomoPoint2D }[]} tracks
 * @returns {CameraParams}
 */
exports.refineParams = function(params, tracks){

    var refined = lma(
        function(x){
            var para = camUtils.inflateCameraParams(x.elements);
            var P = camUtils.params2P(para);
            return Vector.create(tracks.map(function(track){
                return exports.projectionError(P, track);
            }));
        },
        laUtils.toVector(camUtils.flattenCameraParams(params)),
        Vector.Zero(tracks.length)
    );

    return camUtils.inflateCameraParams(refined.elements);

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