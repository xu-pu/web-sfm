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
 * @param {Patch} patch
 * @param {CalibratedCamera} cam
 * @returns {Vector[]}
 */
exports.getPatchAxis = function(patch, cam){

    var P = cam.P;
    var c = patch.c;
    var X = cord.toHomo3D(c);
    var n = patch.n;
    var pln = Plane.create(c, n);
    var rc = cord.img2RC(P.x(X));
    var T = projections.getT(cam.R, cam.t);
    var back = Vector.create([rc.col+1, rc.row, cam.f, 1]);
    var perspective = projections.getPerspective(cam.R, cam.t);
    var backtrackDir = cord.toInhomo3D(perspective.inverse().x(back)).subtract(T);
    var backtrack = Line.create(T, backtrackDir);

    var anchorX = pln.intersectionWith(backtrack);
    var anchorY = anchorX.cross(n);
    var ratioY = anchorX.modulus()/anchorY.modulus();

    return [anchorX, anchorY.x(ratioY)];

};