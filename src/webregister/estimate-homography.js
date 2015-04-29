'use strict';

var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector,
    numeric = require('numeric');

var cord     = require('../utils/cord.js'),
    ransac   = require('./../math/ransac.js'),
    lma      = require('../math/nonlinear.js').lma,
    laUtils  = require('../math/la-utils.js'),
    geoUtils = require('../math/geometry-utils.js');

//================================================================

var HOMOGRAPHY_MATCH = 10;

//================================================================


/**
 *
 * @param matches
 * @param metadata
 * @returns {{ dataset: int[][], H: Matrix }}
 */
module.exports = function(matches, metadata){

    if (matches.length < HOMOGRAPHY_MATCH){
        throw 'More matches needed';
    }

    var cam1 = metadata.cam1,
        cam2 = metadata.cam2,
        features1 = metadata.features1,
        features2 = metadata.features2;

    var T1 = Matrix.create([
        [2.0/cam1.width, 0,               -1],
        [0,              2.0/cam1.height, -1],
        [0,              0,                1]
    ]);

    var T2 = Matrix.create([
        [2.0/cam2.width, 0,               -1],
        [0,              2.0/cam2.height, -1],
        [0,              0,                1]
    ]);

    var dataset = matches.map(function(match){
        var f1 = features1[match[0]],
            f2 = features2[match[1]],
            p1 = cord.feature2img(f1),
            p2 = cord.feature2img(f2);
        return { x1: T1.x(p1), x2: T2.x(p2) };
    });

    var results = ransac({
        dataset: dataset,
        metadata: null,
        subset: HOMOGRAPHY_MATCH,
        relGenerator: module.exports.estimateHomography,
        errorGenerator: module.exports.homographyError,
        outlierThreshold: 0.25,
        errorThreshold: 0.004,
        trials: 2000
    });

    var H = module.exports.refineHomography(results.rel, results.dataset);

    var filteredMatches = results.dataset.map(function(pair){
        var i = dataset.indexOf(pair);
        if (i === -1) {
            throw 'Match not fount while constructing filtered matches';
        }
        else {
            return matches[i];
        }
    });

    return {
        H: T2.inverse().x(H).x(T1),
        dataset: filteredMatches
    };

};


/**
 * H * x1 = k * x2
 * @param {PointMatch[]} matches
 * @returns {Matrix}
 */
module.exports.estimateHomography = function(matches){

    var A = [];

    matches.forEach(function(pair){

        var x1 = pair.x1,
            x2 = pair.x2,
            x2Hat = laUtils.crossVector(x2),
            xx1 = Matrix.create([x1.elements]);

        x2Hat.elements.forEach(function(eles){
            var xx2 = Matrix.create(eles),
                coeM = xx2.x(xx1),
                coeV = _.flatten(coeM.elements);
            A.push(coeV)
        });

    });

    A = Matrix.create(A);

    var solve = laUtils.svdSolve(A);

    return laUtils.inflateVector(solve, 3, 3);

};


/**
 * Homography error = || x2-x2' ||
 * @param {Matrix} homography
 * @param {PointMatch} match
 * @returns {number}
 */
module.exports.homographyError = function(homography, match){
    var x1 = match.x1,
        x2 = match.x2,
        x2H = homography.x(x1);
    return geoUtils.distHomo2D(x2, x2H);
};


/**
 *
 * @param {Matrix} H
 * @param {PointMatch[]} matches
 * @returns {Matrix}
 */
module.exports.refineHomography = function(H, matches){

    var refined = lma(
        function(parameters){
            var currentF = laUtils.inflateVector(parameters, 3, 3);
            return Vector.create(matches.map(function(match){
                return module.exports.homographyError(currentF, match);
            }));
        },
        laUtils.flattenMatrix(H).x(10000000),
        Vector.Zero(matches.length)
    );

    return laUtils.inflateVector(refined, 3, 3);

};