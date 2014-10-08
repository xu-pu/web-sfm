'use strict';

/**
 * @typedef {{R, t}} CalibratedCamera
 */

var pool = require('ndarray-scratch'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

module.exports = rectification;

function rectification(R1, R2, t1, t2){
    var R = R2.x(R1.transpose()),
        t = t2.subtract(R.x(t1)),
        T = R.transpose().x(t).x(-1),
        e1 = normalize(T),
        e2 = normalize(Vector.create([-T.elements[1], T.elements[0], 0])),
        e3 = normalize(e1.cross(e2)),
        rect = Matrix.create([e1.elements, e2.elements, e3.elements]).transpose();
    return [rect, R.transpose().x(rect)]; // delta R1, R2
}

function normalize(v){
    return v.multiply(1/v.modulus())
}


/**
 *
 * @param {CalibratedCamera} cam1 -- as reference
 * @param {CalibratedCamera} cam2
 * @returns {function[]}
 */
function formerRectification(cam1, cam2) {
    var R = cam2.R.dot(cam1.R.transpose());
    var t = cam2.t.sub(cam1.t);

    var e1 = t.normalize();
    var e2 = SFM.M([[-t.get(1,0), t.get(0,0), 0]]).transpose().normalize();
    var e3 = e1.cross().dot(e2).normalize();

    var rect = SFM.M([e1.getNativeCols()[0], e2.getNativeCols()[0], e3.getNativeCols()[0]]);
    var R1 = rect.dot(R),
        R2 = rect;

    var homo1 = function(x, y){
        var point = SFM.M([[ x-(cam1.width/2), y-(cam1.height/2), cam1.focal ]]).transpose();
        var result = R1.dot(point);
        return [result.get(0,0), result.get(1,0)];
    };

    var homo2 = function(x, y){
        var point = SFM.M([[ x-(cam2.width/2), y-(cam2.height/2), cam2.focal ]]).transpose();
        var result = R2.dot(point).dot(cam1.focal/cam2.focal);
        return [result.get(0,0), result.get(1,0)];
    };

    return [homo1, homo2];
}
