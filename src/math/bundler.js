'use strict';

var la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

module.exports.getStandardRt = getStandardRt;
module.exports.world2img = world2img;
module.exports.world2RT  = worldRT;
module.exports.getProjectionMatrix = getProjectionMatrix;
module.exports.getCalibrationMatrix = getCalibrationMatrix;


/**
 *
 * @param X
 * @param R
 * @param t
 */
function world2perspective(X, R, t){
    return R.x(X).add(t);
}

function perspective2world(P, R, t){
    return R.transpose().x(P.subtract(t));
}

function world2img(X, R, t, focal, k1, k2, width, height){}

/**
 * @param X
 * @param R
 * @param t
 * @param focal
 * @param width
 * @param height
 * @returns {{row: number, col: *}}
 */
function worldRT(X, R, t, focal, width, height){
    var P = world2perspective(X, R, t);
    P = P.x(-focal/P.elements[2]); // perspective divide
    var x = P.elements[0], y = P.elements[1];
    return {
        row: height/2 - y,
        col: x + width/2
    };
}

/**
 * @param R
 * @param t
 */
function getCameraPosition(R, t){
    return R.transpose().x(t).x(-1);
}

function getCalibrationMatrix(focal, width, height){

    return Matrix.create([
        [-focal, 0     , width/2 ],
        [0     , -focal, height/2],
        [0     , 0     , 1       ]
    ]);

}


function getProjectionMatrix(R, t, focal, width, height){

    var K = getCalibrationMatrix(focal, width, height).augment(Vector.create([0,0,0]));
    var P = R.augment(t).transpose().augment(Vector.create([0,0,0,1])).transpose();
    return K.x(P);

}


var standardTransform = Matrix.create([
    [-1, 0 , 0],
    [0 , -1, 0],
    [0 , 0 , 1]
]);

function getStandardRt(R ,t){
    return {
        R: R.x(-1),
        t: t.x(-1)
    };

    /*
        return {
            R: standardTransform.x(R),
            t: standardTransform.x(t)
        };
    */
}