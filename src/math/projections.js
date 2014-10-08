'use strict';

var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

module.exports.getProjectionMatrix = getProjectionMatrix;
module.exports.getCalibrationMatrix = getCalibrationMatrix;
module.exports.getFundamentalMatrix = getFundamentalMatrix;
module.exports.getEssentialMatrix = getEssentialMatrix;


function getCalibrationMatrix(focal, width, height){

    return Matrix.create([
        [focal, 0    , width/2 ],
        [0    , focal, height/2],
        [0    , 0    , 1       ]
    ]);

}

function getProjectionMatrix(R, t, focal, width, height){
    var K = getCalibrationMatrix(focal, width, height).augment(Vector.create([0,0,0]));
    var P = R.augment(t).transpose().augment(Vector.create([0,0,0,1])).transpose();
    return K.x(P);
}

function getFundamentalMatrix(R1, t1, f1, cam1, R2, t2, f2, cam2){
    var E = getEssentialMatrix(R1, t1, R2, t2),
        K1 = getCalibrationMatrix(f1, cam1.width, cam1.height),
        K2 = getCalibrationMatrix(f2, cam2.width, cam2.height),
        F = K1.transpose().inverse().x(E).x(K2.inverse()),
        modulus = Vector.create(_.flatten(F.elements)).modulus();
    return F.x(1/modulus);
}

function getEssentialMatrix(R1, t1, R2, t2){
    var R = R2.x(R1.transpose()),
        t = t2.subtract(R.x(t1)),
        T = R.transpose().x(t).x(-1),
        Tx = Matrix.create([
            [ 0      , -T.e(3) , T.e(2) ],
            [ T.e(3) , 0       , -T.e(1)],
            [ -t.e(2), t.e(1)  , 0      ]
        ]),
        E = R.x(Tx),
        modulus = Vector.create(_.flatten(E.elements)).modulus();
    return E.x(1/modulus).transpose();
}