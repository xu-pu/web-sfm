'use strict';

var la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

var cord = require('../utils/cord.js');

//==========================================================


/**
 *
 * @param x
 * @param y
 * @param z
 * @returns {*}
 */
module.exports.getRotation = function getRotation(x,y,z){
    return rotateX(x).x(rotateY(y)).x(rotateZ(z));
};


/**
 * Convert euler angles to rotation matrix
 * @param {number} alpha
 * @param {number} beta
 * @param {number} gamma
 * @returns {Matrix}
 */
module.exports.getRotationFromEuler = function(alpha, beta, gamma){
    return rotateZ(gamma).transpose()
        .x(rotateX(beta).transpose())
        .x(rotateZ(alpha).transpose());
};


/**
 * Convert rotation matrix to euler angles
 * alpha - axis z   , x->N
 * beta  - axis N(x), z->Z
 * gamma - axis Z   , N->X
 * @param {Matrix} R
 * @returns {number[]} - alpha, beta, gamma
 */
module.exports.getEulerAngles = function(R){

    // prepare

    var RR = R.transpose(),
        x = Vector.create([1,0,0]),
        y = Vector.create([0,1,0]),
        z = Vector.create([0,0,1]),
        X = RR.x(x),
        Y = RR.x(y),
        Z = RR.x(z),
        N = Vector.create([1, -Z.e(1)/ Z.e(2), 0]),
        NN = Vector.create([1, -Z.e(1)/ Z.e(2), 0]).x(-1);

    var rotated;

    // get alpha
    var alpha = Math.min(
            exports.getRightHandRotation([x.e(1), x.e(2)], [N.e(1), N.e(2)]),
            exports.getRightHandRotation([x.e(1), x.e(2)], [NN.e(1), NN.e(2)])
        );

    rotated = rotateZ(alpha).transpose();

    // get beta
    var zz = rotated.x(z),
        ZZ = rotated.x(Z),
        beta = exports.getRightHandRotation([zz.e(2), zz.e(3)], [ZZ.e(2), ZZ.e(3)]);

    rotated = rotateX(beta).transpose().x(rotated);

    // get gamma
    var XX = rotated.x(X),
        gamma = exports.getRightHandRotation([x.e(1), x.e(2)], [XX.e(1), XX.e(2)]);

    return [alpha, beta, gamma];

};


/**
 * Get 3D right hand roation from fromV to toV of format (x,y) or (y,z) or (z,x)
 * @param {number[]} fromV
 * @param {number[]} toV
 * @returns {number}
 */
module.exports.getRightHandRotation = function(fromV, toV){
    var x1 = fromV[0], y1 = fromV[1],
        x2 = toV[0]  , y2 = toV[1];
    var fromAng = Math.atan2(y1, x1),
        toAng = Math.atan2(y2, x2);
    toAng = toAng >= fromAng ? toAng : toAng+2*Math.PI;
    return toAng-fromAng;
};


/**
 * Distance from point to line
 * @param point - Vector
 * @param line - Vector
 */
module.exports.getPoint2Line = function(point, line){
    var a = line.e(1), b = line.e(2),
        modulus = Math.sqrt(a*a+b*b)*point.e(3);
    return Math.abs(point.dot(line)/modulus);
};


/**
 * Distance in (row,col)
 * @param {RowCol} rc1
 * @param {RowCol} rc2
 * @returns number
 */
module.exports.getDistanceRC = function(rc1, rc2){
    var dr = rc1.row - rc2.row;
    var dc = rc1.col - rc2.col;
    return Math.sqrt( dr*dr + dc*dc );
};


/**
 *
 * @param {RowCol} rc1
 * @param {RowCol} rc2
 * @param {Camera} cam
 * @returns number
 */
module.exports.getNormalizedDist = function(rc1, rc2, cam){
    var dr = (rc1.row - rc2.row)/cam.height;
    var dc = (rc1.col - rc2.col)/cam.width;
    return Math.sqrt( dr*dr + dc*dc );
};


/**
 * @param {HomoPoint2D} p1
 * @param {HomoPoint2D} p2
 * @returns {number}
 */
module.exports.distHomo2D = function(p1, p2){
    return module.exports.getDistanceRC(cord.img2RC(p1), cord.img2RC(p2));
};


//==========================================================


/**
 *
 * @param {number} angle
 * @returns {Matrix}
 */
function rotateX(angle){
    return Matrix.create([
        [ 1, 0              ,  0               ],
        [ 0, Math.cos(angle), -Math.sin(angle) ],
        [ 0, Math.sin(angle),  Math.cos(angle) ]
    ]);
}


/**
 *
 * @param {number} angle
 * @returns {Matrix}
 */
function rotateY(angle){
    return Matrix.create([
        [  Math.cos(angle), 0, Math.sin(angle) ],
        [  0              , 1, 0               ],
        [ -Math.sin(angle), 0, Math.cos(angle) ]
    ]);
}


/**
 *
 * @param {number} angle
 * @returns {Matrix}
 */
function rotateZ(angle){
    return Matrix.create([
        [ Math.cos(angle), -Math.sin(angle), 0 ],
        [ Math.sin(angle),  Math.cos(angle), 0 ],
        [ 0              ,  0              , 1 ]
    ]);
}