'use strict';
/************************************************
 * View Geometry and Camera Models
 ************************************************/

var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

var geoUtils = require('./geometry-utils.js'),
    laUtils = require('./la-utils.js');

//===================================
// Stored Camera
//===================================

/**
 *
 * @param {StoredCamera} stored
 * @return {CalibratedCamera}
 */
exports.stored2calibrated = function(stored){
    var R = geoUtils.getRotationFromEuler.apply(null, stored.r),
        t = laUtils.toVector(stored.t),
        T = exports.Rt2T(R, t),
        K = exports.getK(stored.f, stored.px, stored.py),
        P = exports.KRt2P(K, R, t);
    return { K: K, R: R, t: t, T: T, P: P, focal: stored.f, px: stored.px, py: stored.py, cam: stored.shape };
};

//===================================
// CameraModel
//===================================

/**
 *
 * @param {CameraModel} model
 * @returns Matrix
 */
exports.model2P = function(model){
    return exports.KRt2P(model.K, model.R, model.t);
};

/**
 *
 * @param {CameraModel} model
 * @returns {Vector}
 */
exports.model2T = function(model){
    return exports.Rt2T(model.R, model.t);
};


/**
 *
 * @param {Matrix} R
 * @param {Vector} t
 * returns {Vector}
 */
exports.Rt2T = function(R, t){
    return R.transpose().x(t).x(-1);
};


/**
 *
 * @param {Matrix} R
 * @param {Vector} T
 * returns {Vector}
 */
exports.RT2t = function(R, T){
    return R.x(T).x(-1);
};


//===================================
// CameraParams
//===================================

/**
 * @param {CameraParams} params
 * @returns CameraModel
 */
exports.params2model = function(params){
    return {
        K: exports.getK(params.f, params.px, params.py),
        R: geoUtils.getRotationFromEuler.apply(null, params.r),
        t: laUtils.toVector(params.t)
    };
};


/**
 * @param {number[]} params
 * @returns CameraParams
 */
exports.inflateCameraParams = function(params){
    return {
        r: params.slice(0,3),
        t: params.slice(3,6),
        f: params[6], px: params[7], py: params[8],
        k1: params[9], k2: params[10]
    };
};


/**
 *
 * @param {CameraParams} cam
 * @returns number[]
 */
exports.flattenCameraParams = function(cam){
    var r = cam.r, t = cam.t;
    return r.concat(t).concat([cam.f, cam.px, cam.py, cam.k1, cam.k2]);
};


//===================================
// Projection
//===================================


/**
 * get RT of cam2 relative to cam1
 * @param {Matrix} R1
 * @param {Vector} t1
 * @param {Matrix} R2
 * @param {Vector} t2
 * @returns {{ R: Matrix, t: Vector }}
 */
exports.getRelativePose = function(R1, t1, R2, t2){
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
exports.getPerspective = function(R, t){
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
 * @param {Matrix} R1
 * @param {Vector} t1
 * @param {Matrix} R2
 * @param {Vector} t2
 * @returns Matrix
 */
exports.getEssentialMatrix = function (R1, t1, R2, t2){
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
 * @returns Matrix
 */
exports.getCalibrationMatrix = function(focal, width, height){

    return laUtils.toMatrix([
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
exports.getK = function(focal, px, py){
    return laUtils.toMatrix([
        [ focal, 0    , px ],
        [ 0    , focal, py ],
        [ 0    , 0    , 1  ]
    ]);
};

/**
 *
 * @param {Matrix} R
 * @param {Vector} t
 * @param {number} focal
 * @param {number} width
 * @param {number} height
 * @returns Matrix
 */
exports.getProjectionMatrix = function(R, t, focal, width, height){
    var K = exports.getCalibrationMatrix(focal, width, height).augment(Vector.create([0,0,0]));
    var P = R.augment(t).transpose().augment(Vector.create([0,0,0,1])).transpose();
    return K.x(P);
};


/**
 *
 * @param {Matrix} R1
 * @param {Vector} t1
 * @param {number} f1
 * @param {Camera} cam1
 * @param {Matrix} R2
 * @param {Matrix} t2
 * @param {number} f2
 * @param {Camera} cam2
 * @returns Matrix
 */
exports.getFundamentalMatrix = function(R1, t1, f1, cam1, R2, t2, f2, cam2){
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
exports.params2P = function(cam){
    var r = cam.r,
        R = geoUtils.getRotationFromEuler(r[0], r[1], r[2]),
        t = laUtils.toVector(cam.t),
        K = exports.getK(cam.f, cam.px, cam.py);
    return exports.KRt2P(K, R, t);
};


/**
 *
 * @param {Matrix} K
 * @param {Matrix} R
 * @param {Vector} t
 * @returns Matrix
 */
exports.KRt2P = function(K, R, t){
    return K.x(R.augment(t));
};


//===================================

function normalizeMatrix(m){
    var modulus = Vector.create(_.flatten(m.elements)).modulus();
    return m.x(1/modulus);
}