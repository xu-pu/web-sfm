'use strict';

var la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector,
    Plane = la.Plane;

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
 * Convert rotation matrix to euler angles
 * @param R
 * @returns {number[]}
 */
module.exports.getEulerAngles = function(R){

    var origin = Vector.create([0,0,0]),
        z = Vector.create([0,0,1]),
        Z = R.x(z),
        p = Plane.create(origin, z),
        P = Plane.create(origin, Z),
        nline = p.intersectionWith(P).direction,
        n = nline.x(1/nline.modulus()),
        N = R.transpose().x(n);
};


/**
 * Distance from point to line
 * @param point - Vector
 * @param line - Vector
 */
module.exports.getPoint2Line = function(point, line){
    var a = line.e(1), b = line.e(2),
        modulus = Math.sqrt(a*a+b*b);
    return Math.abs(point.dot(line)/modulus);
};

//==========================================================


function rotateX(angle){
    return Matrix.create([
        [1,0,0],
        [0, Math.cos(angle), Math.sin(angle)],
        [0, -Math.sin(angle), Math.cos(angle)]
    ]);
}


function rotateY(angle){
    return Matrix.create([
        [Math.cos(angle), 0, Math.sin(angle)],
        [0,1,0],
        [-Math.sin(angle), 0, Math.cos(angle)]
    ]);
}


function rotateZ(angle){
    return Matrix.create([
        [Math.cos(angle), Math.sin(angle), 0],
        [-Math.sin(angle), Math.cos(angle), 0],
        [0,0,1]
    ]);
}
