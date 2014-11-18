'use strict';

var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

module.exports.getProjectionMatrix = getProjectionMatrix;
module.exports.getCalibrationMatrix = getCalibrationMatrix;
module.exports.getFundamentalMatrix = getFundamentalMatrix;
module.exports.getEssentialMatrix = getEssentialMatrix;


/**
 *
 * @param {number} focal
 * @param {number} width
 * @param {number} height
 */
function getCalibrationMatrix(focal, width, height){

    return Matrix.create([
        [focal, 0    , width/2 ],
        [0    , focal, height/2],
        [0    , 0    , 1       ]
    ]);

}


/**
 *
 * @param R
 * @param t
 * @param {number} focal
 * @param {number} width
 * @param {number} height
 */
function getProjectionMatrix(R, t, focal, width, height){
    var K = getCalibrationMatrix(focal, width, height).augment(Vector.create([0,0,0]));
    var P = R.augment(t).transpose().augment(Vector.create([0,0,0,1])).transpose();
    return K.x(P);
}


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
function getFundamentalMatrix(R1, t1, f1, cam1, R2, t2, f2, cam2){
    var E = getEssentialMatrix(R1, t1, R2, t2),
        K1 = getCalibrationMatrix(f1, cam1.width, cam1.height),
        K2 = getCalibrationMatrix(f2, cam2.width, cam2.height),
        F = K1.transpose().inverse().x(E).x(K2.inverse());
    return normalizeMatrix(F);
}


/**
 * @param R1
 * @param t1
 * @param R2
 * @param t2
 */
function getEssentialMatrix(R1, t1, R2, t2){
    var R = R2.x(R1.transpose()),
        t = R2.x(t1).add(t2),
        Tx = Matrix.create([
            [ 0      , -t.e(3) , t.e(2) ],
            [ t.e(3) , 0       , -t.e(1)],
            [ -t.e(2), t.e(1)  , 0      ]
        ]),
        E = R.transpose().x(Tx);
    return normalizeMatrix(E);
}


function normalizeMatrix(m){
    var modulus = Vector.create(_.flatten(m.elements)).modulus();
    return m.x(1/modulus);
}