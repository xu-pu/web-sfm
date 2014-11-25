'use strict';

var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

var ransac = require('./ransac.js'),
    cord = require('../utils/cord.js'),
    estimateFmatrix = require('./estimate-fmatrix.js');

//====================================================


/**
 * @typedef {{features1: Feature[], features2: Feature[], cam2: Camera, cam2: Camera}} TwoViewMetadata
 */


//====================================================


/**
 * Normalized eight point algorithm to filter matches and estimate Fmatrix
 * @param {int[][]} matches
 * @param {TwoViewMetadata} metadata
 * @returns {{dataset: [], F}}
 */
module.exports = function(matches, metadata){

    var cam1 = metadata.cam1,
        cam2 = metadata.cam2,
        features1 = metadata.features1,
        features2 = metadata.features2;

    var T1 = Matrix.create([
        [ 1/cam1.width, 0            , 0 ],
        [ 0           , 1/cam1.height, 0 ],
        [ 0           , 0            , 1 ]
    ]);

    var T2 = Matrix.create([
        [ 1/cam2.width, 0            , 0 ],
        [ 0           , 1/cam2.height, 0 ],
        [ 0           , 0            , 1 ]
    ]);

    var normalizedMatches = matches.map(function(match){
        var f1 = features1[match[0]],
            f2 = features2[match[1]],
            p1 = Vector.create(cord.featureToImg(f1, cam1)),
            p2 = Vector.create(cord.featureToImg(f2, cam2));
        return { x1: T1.x(p1), x2: T2.x(p2) };
    });

    var results = ransac({
        dataset: normalizedMatches,
        metadata: null,
        subset: 8,
        relGenerator: estimateFmatrix,
        errorGenerator: module.exports.fundamentalMatrixError,
        outlierThreshold: 0.15,
        errorThreshold: 0.006,
        trials: 2000
    });

    var Fsvd = estimateFmatrix(_.sample(results.dataset, 100)),
        F = refineF(Fsvd, results.dataset);

    F = T1.transpose().x(F).x(T2);

    var filteredMatches = results.dataset.map(function(pair){
        var i = normalizedMatches.indexOf(pair);
        if (i === -1) {
            throw 'Match not fount while constructing filtered matches';
        }
        else {
            return matches[i];
        }
    });

    return {
        dataset: filteredMatches,
        F: F
    };

};


/**
 * fundamental matrix error for a match
 * @param F
 * @param {{x1, x2}} match
 * @return {number}
 */
module.exports.fundamentalMatrixError = function(F, match){
    var p1 = match.x1,
        p2 = match.x2,
        line = F.x(p2),
        a = line.e(1), b = line.e(2),
        modulus = Math.sqrt(a*a+b*b);
    return Math.abs(p1.dot(line)/modulus);
};


function refineF(F, matches){
    return F;
}