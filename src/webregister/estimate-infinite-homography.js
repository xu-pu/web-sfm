'use strict';

var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector,
    numeric = require('numeric'),
    cord = require('../utils/cord.js');


/**
 *
 * @param matches
 * @param metadata
 * @returns {*}
 */
module.exports = function(matches, metadata){

    if (matches.length !== 4){
        throw 'need exact 4 points';
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
            [0,              0,                1]]
    );

    var A = [];
    matches.forEach(function(match){
        var f1 = features1[match[0]],
            f2 = features2[match[1]],
            p1 = Matrix.create([cord.featureToImg(f1)]).transpose(),
            p2 = Matrix.create([cord.featureToImg(f2)]).transpose();
        p1 = T1.x(p1).transpose();
        p2 = T2.x(p2).transpose();
        var xx = p2.elements[0][0],
            yy = p2.elements[0][1],
            zz = p2.elements[0][2];
        var param1 = Matrix.create([[ -1,0, xx/zz]]).transpose(),
            param2 = Matrix.create([[ 0,-1, yy/zz]]).transpose();
        A.push(_.flatten(param1.x(p1).elements));
        A.push(_.flatten(param2.x(p1).elements));
    });
    A = Matrix.create(A);

    var result = Matrix.create(numeric.svd(A.transpose().elements).U).col(8);

    var F = Matrix.create([
        result.elements.slice(0, 3),
        result.elements.slice(3, 6),
        result.elements.slice(6, 9)
    ]);

    if (F.determinant() !== 0) {
        var fSVD = F.svd();
        fSVD.S.elements[2][2] = 0;
        F = fSVD.U.x(fSVD.S).x(fSVD.V.transpose());
    }
    return T2.inverse().x(F).x(T1);
};


/**
 *
 * @param matches
 */
module.exports.estimateHomography = function(matches){

};


/**
 *
 * @param {Matrix} homography
 * @param {Vector[]} match
 * @returns {number}
 */
module.exports.homographyError = function(homography, match){
    var p1 = match[0],
        p2 = match[1];
    return homography.x(p1).subtract(p2).modulus();
};