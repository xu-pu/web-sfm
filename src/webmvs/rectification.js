'use strict';

var la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

//===================================================


/**
 * Rectify a pair of calibrated cameras
 * @param R1
 * @param R2
 * @param t1
 * @param t2
 * @returns {[]} - rotations needed for rectification of each camera
 */
module.exports = function(R1, R2, t1, t2){
    var R = R2.x(R1.transpose()),
        t = t2.subtract(R.x(t1)),
        T = R.transpose().x(t).x(-1),
        e1 = normalize(T),
        e2 = normalize(Vector.create([-T.elements[1], T.elements[0], 0])),
        e3 = normalize(e1.cross(e2)),
        rect = Matrix.create([e1.elements, e2.elements, e3.elements]);
    return [rect, rect.x(R.transpose())]; // delta R1, R2
};


//===================================================


function normalize(v){
    return v.multiply(1/v.modulus())
}