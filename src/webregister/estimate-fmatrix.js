'use strict';

var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector,
    numeric = require('numeric'),
    cord = require('../utils/cord.js');

//=================================================


/**
 * recover fmatrix from image cord pairs using svd
 * @param {{x1, x2}[]} matches - in image cord
 */
module.exports = function(matches){

    var A = Matrix.create(matches.map(function(match){
        var x1 = match.x1.elements,
            x2 = match.x2.elements,
            p1 = Matrix.create(x1),
            p2 = Matrix.create([x2]);
        return _.flatten(p1.x(p2).elements);
    }));

    var V = A.svd().V,
        v = V.col(9),
        vv = v.x(1/v.modulus()),
        result = vv.elements;

    return Matrix.create([
        result.slice(0, 3),
        result.slice(3, 6),
        result.slice(6, 9)
    ]);

};


/**
 * @param {int[][]} matches
 * @param {object} metadata
 * @param {Camera} metadata.cam1
 * @param {Camera} metadata.cam2
 * @param {Feature[]} metadata.features1
 * @param {Feature[]} metadata.features2
 */
module.exports.shortcut = function(matches, metadata){

    var features1 = metadata.features1,
        features2 = metadata.features2,
        cam1 = metadata.cam1,
        cam2 = metadata.cam2;

    var formatted = matches.map(function(match){
        var f1 = features1[match[0]],
            f2 = features2[match[1]];
        return {
            x1: Vector.create(cord.featureToImg(f1, cam1)),
            x2: Vector.create(cord.featureToImg(f2, cam2))
        };
    });

    return module.exports(formatted);

};