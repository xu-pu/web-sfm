'use strict';

window.SFM = SFM || {};

/**
 *
 * @param {CalibratedCamera} cam1
 * @param {CalibratedCamera} cam2
 * @param {SFM.Matrix} cam1Point
 * @param {SFM.Matrix} cam2Point
 */
SFM.trianguation = function(cam1, cam2, cam1Point, cam2Point){
    var A = [];
    A[0] = cam1.P.getRow(2).dot(cam1Point.get(0,0)).sub(cam1.P.getRow(0));
    A[1] = cam1.P.getRow(2).dot(cam1Point.get(1,0)).sub(cam1.P.getRow(1));
    A[2] = cam2.P.getRow(2).dot(cam2Point.get(0,0)).sub(cam2.P.getRow(0));
    A[3] = cam2.P.getRow(2).dot(cam2Point.get(1,0)).sub(cam2.P.getRow(1));
    A = SFM.M(_.map(A, function(row){
        return row.getNativeRows()[0];
    }));
    return A.svdSolve();
};

SFM.fivePoint = function(cam1, cam2, cam1Points, cam2Points){


};

/**
 *
 * @param {int[][]} dataset
 * @param metadata.cam
 * @param {Feature[]} metadata.features
 * @param {SFM.Matrix[]} metadata.sparse
 * @param metadata
 */
SFM.sixPoint = function(dataset, metadata){
    if (dataset.length !== 6) {
        throw 'need exact 6 matches';
    }
    var A = [];
    _.each(dataset, function(match){
        var imgPoint = SFM.featureToImg(metadata.features[match[0]], metadata.cam);
        var scenePoint = metadata.sparse[match[1]];
        A.push(_.flatten(SFM.M([1,0,-imgPoint.get(0,0)]).transpose().dot(scenePoint.transpose()).getNativeRows()));
        A.push(_.flatten(SFM.M([0,1,-imgPoint.get(1,0)]).transpose().dot(scenePoint.transpose()).getNativeRows()));
    });
    var solve = SFM.M(A).svdSolve();
    var result = new SFM.Matrix({ rows: 3, cols: 4 });
    result.data.set(solve.data);
    return result;
};


/**
 *
 * @param {int[][]} matches
 * @param {object} metadata
 * @param metadata.cam1
 * @param metadata.cam2
 * @param {Feature[]} metadata.features1
 * @param {Feature[]} metadata.features2
 * @returns {SFM.Matrix}
 */
SFM.eightPoint = function(matches, metadata){

    if (matches.length !== 8){
        throw 'need exact 8 points';
    }

    var cam1 = metadata.cam1,
        cam2 = metadata.cam2,
        features1 = metadata.features1,
        features2 = metadata.features2;

    var T1 = new SFM.Matrix({
        array: [[2.0/cam1.width, 0,               -1],
                [0,              2.0/cam1.height, -1],
                [0,              0,                1]]
    });

    var T2 = new SFM.Matrix({
        array: [[2.0/cam2.width, 0,               -1],
                [0,              2.0/cam2.height, -1],
                [0,              0,                1]]
    });

    var A = new SFM.Matrix({
        array: _.map(matches, function(match){
            var f1 = features1[match[0]],
                f2 = features2[match[1]];
            var p1 = SFM.featureToImg(f1, cam1),
                p2 = SFM.featureToImg(f2, cam2);
            p1 = T1.dot(p1);
            p2 = T2.dot(p2);
            return _.flatten(p2.dot(p1.transpose()).getNativeRows());
        })
    });

    var result = A.svd();
    var F = new SFM.Matrix({ cols: 3, rows: 3 });
    F.data.set(_.last(result.V.getNativeRows()));
    if (F.det() !== 0) {
        var fSVD = F.svd();
        fSVD.D.set(2,2,0);
        F = fSVD.U.dot(fSVD.D).dot(fSVD.V);
    }
    return T1.transpose().dot(F).dot(T2);
};

/**
 *
 * @param {SFM.Matrix} F
 * @param {int[]} match
 * @param metadata
 * @param metadata.cam1
 * @param metadata.cam2
 * @param {Feature[]} metadata.features1
 * @param {Feature[]} metadata.features2
 * @return {number}
 */
SFM.fundamentalMatrixError = function(F, match, metadata){
    var f1 = metadata.features1[match[0]],
        f2 = metadata.features2[match[1]];
    var p1 = SFM.featureToImg(f1, metadata.cam1),
        p2 = SFM.featureToImg(f2, metadata.cam2);
    return Math.abs(p1.transpose().dot(F).dot(p2));
};
