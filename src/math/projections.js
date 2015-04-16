'use strict';

var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

var geoUtils = require('./geometry-utils.js'),
    laUtils = require('./la-utils.js');

//===================================

/**
 * get RT of cam2 relative to cam1
 * @param R1
 * @param t1
 * @param R2
 * @param t2
 * @returns {{R, t}}
 */
module.exports.getRelativePose = function(R1, t1, R2, t2){
    var R = R2.x(R1.transpose()),
        t = R.x(t1).x(-1).add(t2);
    return { R: R, t: t };
};


/**
 * Get perspective transformation
 * @param {Matrix} R
 * @param {Vector} t
 * @returns {Matrix}
 */
module.exports.getPerspective = function(R, t){
    return R.augment(t).transpose().augment(Vector.create([0,0,0,1])).transpose();
};


/**
 *
 * @param {Matrix} R
 * @param {Vector} t
 * @returns Vector
 */
exports.getT = function(R, t){
    return R.transpose().x(t).x(-1);
};


/**
 * Essential Matrix
 * @param R1
 * @param t1
 * @param R2
 * @param t2
 */
module.exports.getEssentialMatrix = function (R1, t1, R2, t2){
    var pos = exports.getRelativePose(R1, t1, R2, t2),
        R = pos.R,
        t = pos.t,
        T = R.transpose().x(t).x(-1),
        Tx = Matrix.create([
            [ 0      , -T.e(3) , T.e(2) ],
            [ T.e(3) , 0       , -T.e(1)],
            [ -T.e(2), T.e(1)  , 0      ]
        ]),
        E = Tx.x(R.transpose());
    return normalizeMatrix(E);
};



/**
 *
 * @param {number} focal
 * @param {number} width
 * @param {number} height
 */
module.exports.getCalibrationMatrix = function(focal, width, height){

    return Matrix.create([
        [focal, 0    , width/2 ],
        [0    , focal, height/2],
        [0    , 0    , 1       ]
    ]);

};


/**
 *
 * @param {number} focal
 * @param {number} px - principal point X
 * @param {number} py - principal point y
 * @returns Matrix
 */
module.exports.getK = function(focal, px, py){
    return Matrix.create([
        [ focal, 0    , px ],
        [ 0    , focal, py ],
        [ 0    , 0    , 1  ]
    ]);
};

/**
 *
 * @param R
 * @param t
 * @param {number} focal
 * @param {number} width
 * @param {number} height
 */
module.exports.getProjectionMatrix = function(R, t, focal, width, height){
    var K = exports.getCalibrationMatrix(focal, width, height).augment(Vector.create([0,0,0]));
    var P = R.augment(t).transpose().augment(Vector.create([0,0,0,1])).transpose();
    return K.x(P);
};


/**
 *
 * @param R1
 * @param t1
 * @param {number} f1
 * @param {Camera} cam1
 * @param R2
 * @param t2
 * @param {number} f2
 * @param {Camera} cam2
 */
module.exports.getFundamentalMatrix = function(R1, t1, f1, cam1, R2, t2, f2, cam2){
    var E = exports.getEssentialMatrix(R1, t1, R2, t2),
        K1 = exports.getCalibrationMatrix(f1, cam1.width, cam1.height),
        K2 = exports.getCalibrationMatrix(f2, cam2.width, cam2.height),
        F = K1.transpose().inverse().x(E).x(K2.inverse());
    return normalizeMatrix(F);
};


/**
 *
 * @param {Matrix} R
 * @param {Vector} t
 * @param {Matrix} K
 * @param {number} k1
 * @param {number} k2
 * @returns {Function}
 */
exports.getDistortedProjection = function(R, t, K, k1, k2){

    /**
     * @param {Vector} X
     * @returns Vector
     */
    return function(X){
        var P = R.x(X).add(t);
//        var p = P.x(P.e(3));
//        var x = p.e(1);
//        var y = p.e(2);
//        var norm2 = (x/f)*(x/f)+(y/f)*(y/f);
//        var factor = 1 + k1*norm2 + k2*norm2*norm2;
//        var distorted = Vector.create([x*factor,y*factor,1]);
        return K.x(P);
    };

};


/**
 *
 * @param {CameraParams} cam
 * @returns Matrix
 */
exports.getP = function(cam){
    var r = cam.r,
        R = geoUtils.getRotationFromEuler(r[0], r[1], r[2]),
        t = laUtils.toVector(cam.t);
    var K = exports.getK(cam.f, cam.px, cam.py);
    return K.x(R.augment(t));
};


//===================================

function normalizeMatrix(m){
    var modulus = Vector.create(_.flatten(m.elements)).modulus();
    return m.x(1/modulus);
}