var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector,
    numeric = require('numeric'),
    cord = require('../utils/cord.js');

module.exports = eightPoint;
module.exports.fundamentalMatrixError = fundamentalMatrixError;

/**
 * @param {int[][]} matches
 * @param {object} metadata
 * @param metadata.cam1
 * @param metadata.cam2
 * @param {Feature[]} metadata.features1
 * @param {Feature[]} metadata.features2
 * @returns {SFM.Matrix}
 */
function eightPoint(matches, metadata){

    if (matches.length !== 8){
        throw 'need exact 8 points';
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

    var A = Matrix.create(_.map(matches, function(match){
        var f1 = features1[match[0]],
            f2 = features2[match[1]];
        var p1 = Matrix.create([cord.featureToImg(f1, cam1)]).transpose(),
            p2 = Matrix.create([cord.featureToImg(f2, cam2)]).transpose();
        p1 = T1.x(p1);
        p2 = T2.x(p2);
        return _.flatten(p2.x(p1.transpose()).elements);
    }));

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
    return T1.transpose().x(F).x(T2);
}


/**
 * @param F
 * @param {int[]} match
 * @param metadata
 * @param {Camera} metadata.cam1
 * @param {Camera} metadata.cam2
 * @param {Feature[]} metadata.features1
 * @param {Feature[]} metadata.features2
 * @return {number}
 */
function fundamentalMatrixError(F, match, metadata){
    var f1 = metadata.features1[match[0]],
        f2 = metadata.features2[match[1]];
    var p1 = Matrix.create([cord.featureToImg(f1, metadata.cam1)]),
        p2 = Vector.create(cord.featureToImg(f2, metadata.cam2));
    return Math.abs(p1.x(F).x(p2).elements[0]);
}