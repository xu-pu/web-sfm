var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector,
    Plane = la.Plane,
    Line = la.Line;

var cord = require('../utils/cord.js'),
    projections = require('../math/projections.js');


/**
 *
 * @param {Vector} c - in-homo
 * @param {Vector} n - in-homo
 * @param {CalibratedCamera} cam
 * @returns {Vector[]}
 */
exports.getPatchAxis = function(c, n, cam){

    var P = cam.P,
        X = cord.toHomo3D(c),
        T = projections.getT(cam.R, cam.t),
        pln = Plane.create(c, n),
        offsetR = cam.cam.height/2, offsetC = cam.cam.width/2;

    // backtrace x-axis
    var rc = cord.img2RC(P.x(X));
    var back = Vector.create([rc.col+1-offsetC, rc.row-offsetR, cam.f, 1]);
    var perspective = projections.getPerspective(cam.R, cam.t);
    var backX = perspective.inverse().x(back);
    var backtrackDir = cord.toInhomo3D(backX).subtract(T);
    var backtrack = Line.create(T, backtrackDir);

    // build patch local x-y axis
    var anchorX = pln.intersectionWith(backtrack).subtract(c),
        anchorY = anchorX.cross(n),
        ratioY = anchorX.modulus()/anchorY.modulus();

    return [anchorX, anchorY.x(ratioY)];

};