'use strict';

var la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector;

var cord = require('../utils/cord.js'),
    getCameraFrame = require('./getCameraFrame.js');

var imgWidth=2000, imgHeight=3000;

module.exports = function(cam){
    var Rt = cord.getStandardRt(Matrix.create(cam.R), Vector.create(cam.t)),
        R = Rt.R, t = Rt.t;
    return getCameraFrame(R, t, cam.focal, imgWidth, imgHeight);
};